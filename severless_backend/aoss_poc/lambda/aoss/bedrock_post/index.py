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
        "accept":"application/json",
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
    logger.debug(response_body)
    answer_text = response_body["content"][0]["text"]

    return answer_text

def best_answer(msg, system_prompt):
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

    logger.info("%s",msg)

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

def answer_via_bedrock(msg, system_prompt):
    #get answer
    answer_result = best_answer(msg=msg, system_prompt=system_prompt)
    answer=answer_result[1]

    return answer

def handler(event, context):
    logger.info("%s",event)
    logger.info("%s",context)

    try:
        payload=event.get("body")
        field_values=json.loads(payload)

        msg = field_values["msg"]
        system_prompt = field_values["system_prompt"]

        if( BENCHMARKING ):
            logger.debug("===================================")
            logger.debug("BENCHMARKING")
            logger.debug("===================================")
            logger.debug("user_question: %s",msg)
            logger.debug("system_prompt: %s",system_prompt)
            logger.debug("+++++++++++++++++++++++++++++++++++")
        
        msg = MODE_LIST[MODE](msg)

        answer= answer_via_bedrock(msg=msg, system_prompt=system_prompt)

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