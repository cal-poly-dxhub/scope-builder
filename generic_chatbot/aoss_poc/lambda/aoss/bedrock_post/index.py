import json
import boto3
import os

from requests_aws4auth import AWS4Auth
from opensearchpy import OpenSearch, RequestsHttpConnection

from string import Template, ascii_letters, digits
import time
import hashlib
import datetime
import random
import logging
import numpy as np

####################################
# LOGGING CONFIG
####################################
BENCHMARKING=True

# Create a custom filter
class DebugFilter(logging.Filter):
    def filter(self, record):
        return record.levelno == logging.DEBUG

logger = logging.getLogger(__name__)

# Set the logger level
if BENCHMARKING:
    logger.setLevel(logging.DEBUG)
    # Add the filter to the logger
    logger.addFilter(DebugFilter())
else:
    logger.setLevel(logging.CRITICAL)

####################################

CORS_HEADERS = {
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Origin': os.environ["CORS_ALLOW_UI"] if os.environ["LOCALHOST_ORIGIN"] == "" else os.environ["LOCALHOST_ORIGIN"],
    'Access-Control-Allow-Methods': 'OPTIONS,POST,GET'
}

BEDROCK_MODE="CLAUDE.TXT"
# probably make this a shared python file so we don't duplicate code
BEDROCK_CONFIGURATION = {
    "CLAUDE.TXT": {
        "model_id":"anthropic.claude-3-haiku-20240307-v1:0",
        "content_type":"application/json",
        "accept":"*/*",
        "payload":{
            "anthropic_version": "bedrock-2023-05-31",
            "messages":[],
            "system":"",
            "max_tokens":0,
            "temperature":0,
            "top_p":0,
            "top_k":0,
            "stop_sequences":["Human:"]
        }
    }
}
BEDROCK_SELECTION=BEDROCK_CONFIGURATION[BEDROCK_MODE]

bedrock_client = boto3.client(service_name="bedrock-runtime")

def hyde(user_input):
    TEMPERATURE=.1
    TOP_P=.8
    MAX_TOKENS_TO_SAMPLE=512
    TOP_K=250

    system_prompt = """Human: Generate a ficticious article that answers the following user prompt: $user_input
    Assistant:
    """
    template = Template(system_prompt)
    prompt = template.substitute(user_input=user_input)

    logger.info("%s",prompt)
    msg = [ 
        {
            "role":"user",
            "content":prompt
        }
    ]
    BEDROCK_SELECTION["payload"]["messages"] = msg
    BEDROCK_SELECTION["payload"]["system"] = system_prompt
    BEDROCK_SELECTION["payload"]["temperature"] = TEMPERATURE
    BEDROCK_SELECTION["payload"]["top_k"] = TOP_K
    BEDROCK_SELECTION["payload"]["top_p"] = TOP_P
    BEDROCK_SELECTION["payload"]["max_tokens"] = MAX_TOKENS_TO_SAMPLE
    body = json.dumps(BEDROCK_SELECTION["payload"])

    response = bedrock_client.invoke_model(
        body=body, 
        modelId=BEDROCK_SELECTION["model_id"], 
        accept=BEDROCK_SELECTION["accept"], 
        contentType=BEDROCK_SELECTION["content_type"]
    )
    response_body = json.loads(response.get('body').read())

    hyde_generated_text = response_body.get("completion")
    logger.info("%s",hyde_generated_text)

    return hyde_generated_text

def raw(user_input):
    return user_input

# set approach
MODE_LIST = {
    "RAW":raw,
    "HYDE":hyde
    }
MODE="RAW"

def answer(body):
    logger.debug("ANSWER")
    response = bedrock_client.invoke_model(
        body=body, 
        modelId=BEDROCK_SELECTION["model_id"], 
        accept=BEDROCK_SELECTION["accept"], 
        contentType=BEDROCK_SELECTION["content_type"]
    )
    response_body = json.loads(response.get('body').read())
    logging.debug(response_body)
    answer_text = response_body["content"][0]["text"]

    return answer_text

def best_answer(prompt, system_prompt):
    TEMPERATURE=0
    TOP_P=.9
    MAX_TOKENS_TO_SAMPLE=2048
    TOP_K=250

    # system_prompt = "You are a helpful assistant that can answer quesitons based on news articles you have been given."
    # prompt_string = """You are to answer the question using the data in the following article.  Do not make up your answer, only use supporting 
    # data from the article.
    
    # If you don't have enough data simply respond, 'I don't have enough information to answer that question.' 
    
    # Given the following news article data [ $data ] can you please give a concise answer to the following question. [ $question ]"""
    
    # template = Template(prompt_string)
    # prompt = template.substitute(data=data,question=question)

    logger.info("%s",prompt)
    # msg = [ 
    #     {
    #         "role":"user",
    #         "content":prompt
    #     }
    # ]

    msg = [
        {"role":"user", "content": "You are LUCAS, a procurement manager assistant specialized in creating scope of work clauses. Your primary mission is to interactively engage with a user by asking them ONE question at a time and work with them to create a scope of work clause (SOW) for Cal Poly, which is hiring Vantage Gardening for Technology, campus gardening. Only focus on the specific information pertaining to the clause you are working on.\n\nClause: This is an outline of the clause that you will be working on:\n<Clause>\nPlease provide a concise clause that outlines the overall scope of work in a broad, high-level manner. The goal is to capture the essential aspects of the project without delving into specific details such as schedules, supplies, or granular tasks. This clause should serve as a general overview, allowing future interactions to focus on more specific elements.\n</Clause>.\n\nHere is the scope, if already defined. Do not ask questions asking the user for the information in this section, as the document already contains it. <Scope></Scope>\n\nStrategy:\n\nOne-by-One Interaction: Ask only ONE question at a time to ensure clarity and focused responses. Do not ask leading questions unless the user requests your input. Wait for the user’s reply before proceeding to the next question. Keep your response and questions short.\nInteractive Engagement & Flexibility: \nAs the conversation unfolds, adjust your questions based on user responses. Feel free to provide feedback or suggestions to the user.\nClear Call for Action: Clearly convey to the user what input you require in the response. Your responses must contain questions.\nMultiple Subcategories: Consolidate questions from multiple subcategories if they seem less critical.\"\nDetailed Inquiry: If a category requires more depth, detail, or description ask multiple questions.\nFollow-ups: If a user’s answer is vague, delve deeper.\nFeedback Loop: After each function, recap the discussed topics for the user.\nComprehensive Report: After gathering all insights, draft the scope of work document.\nResponse Format:\n\nYou will split your response into Thought, Action, Observation and Response. Use this XML structure and keep everything strictly within these XML tags. Remember, the <Response> tag contains what’s shown to the user. There should be no content outside these XML blocks:\n\n<Thought>Your internal thought process.</Thought><Action>Your actions or analyses.</Action><Observation>User feedback or clarifications.</Observation><Response> Your communication to the user. This is the only visible portion to the user.</Response> <Summary>This will contain a summary of the finished clause if you complete the clause. You only have 128 tokens to summarize the clause. Do not go over this token limit under any circumstance.</Summary><Truths>If you complete the clause this is where you will enter the key truths: a short list of short bullet points of only information that the user has given you. Do not be verbose, be very concise.</Truths>\n\nHere is a list of all the truths in the document: <DocumentTruths></DocumentTruths>\n\nHere is a list of all the truths in the document: <DocumentTruths></DocumentTruths>"},
        {"role":"assistant","content":"<Thought>Since the goal is to provide a concise, high-level overview of the scope of work for this gardening project at Cal Poly, I should start by asking about the overall purpose and main objectives of the project.</Thought>\n\n<Action>No action needed yet, as I do not have enough information to draft the clause.</Action>\n\n<Observation>No user input yet.</Observation>\n\n<Response>To begin drafting the high-level scope of work clause, could you please describe the overall purpose and main objectives of this gardening project at Cal Poly?</Response>\n\n<Summary></Summary>\n<Truths></Truths>"},
        {"role":"user","content":"this is for planting flowers, trimming lawns, and trimming trees"},
        {"role":"assistant","content":"<Thought>Okay, the user has provided some high-level details about the main objectives of the gardening project, which involve planting flowers, trimming lawns, and trimming trees on the Cal Poly campus. To better capture the overall scope, I should ask about any other major gardening services or tasks that should be included.</Thought>\n\n<Action>Updating my understanding of the scope based on the user’s response.</Action>\n\n<Observation>The user stated that the main objectives are planting flowers, trimming lawns, and trimming trees.</Observation>\n\n<Response>Thank you for that overview. Are there any other major gardening services or tasks that should be included in the overall scope of work for this project at Cal Poly? For example, things like landscaping, irrigation system maintenance, etc.</Response>\n\n<Summary></Summary>\n<Truths></Truths>"}
        ]
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            



    BEDROCK_SELECTION["payload"]["messages"] = msg
    BEDROCK_SELECTION["payload"]["system"] = system_prompt
    BEDROCK_SELECTION["payload"]["temperature"] = TEMPERATURE
    BEDROCK_SELECTION["payload"]["top_k"] = TOP_K
    BEDROCK_SELECTION["payload"]["top_p"] = TOP_P
    BEDROCK_SELECTION["payload"]["max_tokens"] = MAX_TOKENS_TO_SAMPLE
    body = json.dumps(BEDROCK_SELECTION["payload"])
    logger.debug("%s",body)

    answer_chunks= answer(body=body)
            

    #response_body = json.loads(response.get('body').read())
    #logger.info(response_body)
    answer_text =answer_chunks
    logger.debug("~~~ANSWER TEXT~~~")
    logger.debug("%s",answer_text)
    if "I don't have enough information to answer that question." in answer_text:
        #mismatch
        logger.debug("++++++++++++RUNNING INSERT INTO MISSED ROUTINE++++++++++++")
        return (-1,answer_text)
    else:
        return (1,answer_text)

def answer_via_bedrock(user_input, system_prompt):
    #get answer
    answer_result = best_answer(prompt=user_input, system_prompt=system_prompt)
    answer=answer_result[1]

    return answer

def handler(event, context):
    logger.info("%s",event)
    logger.info("%s",context)

    try:
        payload=event.get("body")
        field_values=json.loads(payload)

        user_input = field_values["user_prompt"]
        system_prompt = field_values["system_prompt"]

        if( BENCHMARKING ):
            logger.debug("===================================")
            logger.debug("BENCHMARKING")
            logger.debug("===================================")
            logger.debug("user_question: %s",user_input)
            logger.debug("system_prompt: %s",system_prompt)
            logger.debug("+++++++++++++++++++++++++++++++++++")
        
        user_input = MODE_LIST[MODE](user_input)

        answer= answer_via_bedrock(user_input=user_input, system_prompt=system_prompt)

        return {
            "statusCode":200,
            "headers": CORS_HEADERS,
            "body": json.dumps({"search_answer":answer})
        }
    except Exception as e:
        return {
            "statusCode":500,
            "headers": CORS_HEADERS,
            "body": json.dumps({"msg":str(e)})
        }