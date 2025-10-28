# Scope Builder: Generative AI-Powered Work Scope Creation

## Collaboration

Thanks for your interest in our solution. We welcome any replication or extension of this project. If you clone or download this repository, please let us know — it helps us track interest and impact.

[wwps-cic@amazon.com]

## Disclaimers

**Customers are responsible for making their own independent assessment of the information in this document.**

**This document:**

(a) is for informational purposes only,  
(b) represents current AWS product offerings and practices, which are subject to change without notice,  
(c) does not create any commitments or assurances from AWS or its affiliates, and  
(d) is not to be considered a recommendation or viewpoint of AWS.

**All prototype code and assets should be considered:**

- As-is and without warranties
- Not suitable for production environments
- Simplified for rapid prototyping (e.g., relaxed authentication, limited security hardening)

**All work produced is open source. More information can be found in the GitHub repo.**

## Authors

- Gus Flusser – gflusser@calpoly.edu

## Table of Contents

- [Collaboration](#collaboration)
- [Disclaimers](#disclaimers)
- [Authors](#authors)
- [Overview](#overview)
- [High Level Description of Workflow](#high-level-description-of-workflow)
- [Recommended Customer Workflow](#recommended-customer-workflow)
- [Known Bugs/Concerns](#known-bugsconcerns)
- [Support](#support)

## Overview

Scope Builder is a generative AI-powered tool designed to streamline procurement scope-of-work document creation. Built by the Cal Poly DxHub in collaboration with Strategic Business Services, it helps procurement specialists quickly and accurately draft work scopes for RFPs and contracts by leveraging AWS services and Anthropic’s Claude model via Amazon Bedrock.

## High Level Description of Workflow

- **User Interaction**: Users are guided through a conversational AI interface to create tailored scopes of work.
- **Generation**: Claude 3.5 Sonnet generates section-by-section drafts using user inputs, best practices, and prior examples.
- **Editing**: Context-aware editing tools allow intelligent, coherent search-and-replace modifications.
- **Review**: Users perform a final review and make necessary edits before publishing the generated document.

## Recommended Customer Workflow

1. **Log in and initiate a new scope creation session**
2. **Answer guided prompts** to define procurement requirements
3. **Generate full draft** of the scope of work
4. **Make context-aware edits** using smart edit tools
5. **Download and finalize** the document for inclusion in an RFP or contract

## Known Bugs/Concerns

- Generated content may require human review for legal/compliance accuracy
- Model outputs may vary depending on input phrasing
- Context-aware editing is under active development and may produce unexpected replacements

## Support

For questions or issues, contact:

- Gus Flusser – Software Developer Intern – gflusser@calpoly.edu
- Nick Osterbur – Digital Innovation Lead – nosterb@amazon.com
- Darren Kraker – Sr. Solutions Architect – dkraker@amazon.com
