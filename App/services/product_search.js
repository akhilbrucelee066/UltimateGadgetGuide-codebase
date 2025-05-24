import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = "";
const genAI = new GoogleGenerativeAI(API_KEY);

const MAX_RETRIES = 2;

export const searchProduct = async (query) => {
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

  const systemInstruction = `prompt: [You are an AI API[just take input and provide JSON in specified schema as output and nothing more] tasked with retrieving **detailed, real-time product information** for an electronic product based on a product name, along with optional conditions such as price range, brand, specific features, or use case. You will provide a JSON response strictly following the schema defined below. Your response must include accurate and reliable real-time data, fetched from certified sources like **Amazon India** and **Flipkart India** for real-time prices and product URLs[as per 'rule' mentioned below]. You may use additional information from trusted sources like **Gadgets360**, **Gadgetbridge**, **Kimovil**, **Nanoreview**, **91mobiles**, **Allthestuff**, **Tom's Guide**, and **Anandtech** for specifications and expert opinions.
**IMPORTANT**: In whole response there won't be any URLs other than "realtime_product_url_amazon_india" , "realtime_product_url_flipkart_india".["No need realtime urls" but should follow this "rule"]['rule': URLS be like if product:"boat airdopes 131" then realtime_product_url_amazon_india : "https://www.amazon.in/s?k=boat+airdopes+131", realtime_product_url_flipkart_india : "https://www.flipkart.com/search?q=boat+airdopes+131"][both urls should strictly follow the 'rule' format. don't unnecessarily add any other urls just format the way it is shown in 'rule']
**Key Instructions**:
0. **Answer INFORMATION** "Real-time data", "Current prices", "Latest information", "As of today", "Up-to-date", "Most recent"
1. **Real-time prices**: Fetch the current best prices from **Amazon India** and **Flipkart India** in Indian Rupees (INR). Make sure you independently fetch each price from the corresponding platform and provide the accurate search URLs for both Amazon and Flipkart[as per 'rule' mentioned above].
2. **Reliable and factual data**: Use only trusted, certified sources for all information. No assumptions, approximations, or incomplete data should be included.
3. **Strict schema**: Ensure that every field in the JSON schema below is filled with valid, non-empty, real-time data. Never return null, undefined, "NA", or empty values or '0' or blank or empty spaces[if data is insufficient then gather from web or fill the approximate data that could match].
4. **Prices in INR**: Ensure all prices are displayed in **Indian Rupees (INR)**.
5. **English-only text**: Ensure all product details, specifications, and ratings are provided in **English**.
6. in p4 tag section, the tags should contains 1 or 2 worded  usecase or suitability of product or section of consumers or reason to buy this phone.[ex. "parents", "photography", "huge battery", "performance specific", "great speaker", "daily use", "all rounder", "mid range king","ai features", "value for money", "gaming" etc..] 
### **Valid JSON Schema**:

{
  "type": "object",
  "properties": {
    "p1": {
      "type": "object",
      "properties": {
        "product_title": { "type": "string" },
        "realtime_discounted_price_Amazon_india": { "type": "number" },
        "realtime_discounted_price_Flipkart_india": { "type": "number" },
        "realtime_product_url_amazon_india": { "type": "string"},
        "realtime_product_url_flipkart_india": { "type": "string"}
      },
      "required": [
        "product_title",
        "realtime_discounted_price_Amazon_india",
        "realtime_discounted_price_Flipkart_india",
        "realtime_product_url_amazon_india",
        "realtime_product_url_flipkart_india"
      ]
    },
    "p2": {
      "type": "object",
      "properties": {
        "user_rating_out_of_5": { "type": "number" },
        "expert_rating_out_of_5": { "type": "number" },
        "rating_out_of_100_sp1": {
          "type": "object",
          "properties": {
            "specification_name": { "type": "string" },
            "rating": { "type": "number" }
          },
          "required": ["specification_name", "rating"]
        },
        "rating_out_of_100_sp2": {
          "type": "object",
          "properties": {
            "specification_name": { "type": "string" },
            "rating": { "type": "number" }
          },
          "required": ["specification_name", "rating"]
        },
        "rating_out_of_100_sp3": {
          "type": "object",
          "properties": {
            "specification_name": { "type": "string" },
            "rating": { "type": "number" }
          },
          "required": ["specification_name", "rating"]
        },
        "rating_out_of_100_sp4": {
          "type": "object",
          "properties": {
            "specification_name": { "type": "string" },
            "rating": { "type": "number" }
          },
          "required": ["specification_name", "rating"]
        },
        "rating_out_of_100_sp5": {
          "type": "object",
          "properties": {
            "specification_name": { "type": "string" },
            "rating": { "type": "number" }
          },
          "required": ["specification_name", "rating"]
        },
        "rating_out_of_100_overall": { "type": "number" },
        "rating_out_of_100_value_for_money": { "type": "number" }
      },
      "required": [
        "user_rating_out_of_5",
        "expert_rating_out_of_5",
        "rating_out_of_100_sp1",
        "rating_out_of_100_sp2",
        "rating_out_of_100_sp3",
        "rating_out_of_100_sp4",
        "rating_out_of_100_sp5",
        "rating_out_of_100_overall",
        "rating_out_of_100_value_for_money"
      ]
    },
    "p3": {
      "type": "object",
      "properties": {
        "all_product_details_specifications": {
          "type": "object",
          "properties": {
            "1": { "type": "string" },
            "2": { "type": "string" },
            "3": { "type": "string" },
            "4": { "type": "string" },
            "5": { "type": "string" }
          },
          "required": ["1", "2", "3", "4", "5"]
        },
        "Quick_Take_on_all_specifications": {
          "type": "object",
          "properties": {
            "1": { "type": "string" },
            "2": { "type": "string" },
            "3": { "type": "string" },
            "4": { "type": "string" },
            "5": { "type": "string" }
          },
          "required": ["1", "2", "3", "4", "5"]
        },
        "Overall_verdict_with_pros_cons": {
          "type": "object",
          "properties": {
            "1": { "type": "string" },
            "2": { "type": "string" },
            "3": { "type": "string" },
            "4": { "type": "string" },
            "5": { "type": "string" },
            "6": { "type": "string" }
          },
          "required": ["1", "2", "3", "4", "5", "6"]
        }
      },
      "required": [
        "all_product_details_specifications",
        "Quick_Take_on_all_specifications",
        "Overall_verdict_with_pros_cons"
      ]
    },
    "p4": {
      "type": "object",
      "properties": {
        "Tag1": { "type": "string" },
        "Tag2": { "type": "string" },
        "Tag3": { "type": "string" },
        "Tag4": { "type": "string" },
        "Tag5": { "type": "string" },
        "Tag6": { "type": "string" }
      },
      "required": ["Tag1", "Tag2", "Tag3", "Tag4", "Tag5", "Tag6"]
    }
  },
  "required": ["p1", "p2", "p3", "p4"]
}
Instruction: if the data is insufficient or not available fill the approximate data that could match. especially don't keep '0' as value for any keys instead approximately estimate and fill the values.]
`;

  const generationConfig = {
    temperature: 0.7,
    topP: 0.95,
    topK: 64,
    maxOutputTokens: 4096,
    responseMimeType: "application/json",
    response_schema: {
      type: "object",
      properties: {
        p1: {
          type: "object",
          properties: {
            product_title: { type: "string" },
            realtime_discounted_price_Amazon_india: { type: "number" },
            realtime_discounted_price_Flipkart_india: { type: "number" },
            realtime_product_url_amazon_india: { type: "string" },
            realtime_product_url_flipkart_india: { type: "string" }
          },
          required: [
            "product_title",
            "realtime_discounted_price_Amazon_india",
            "realtime_discounted_price_Flipkart_india",
            "realtime_product_url_amazon_india",
            "realtime_product_url_flipkart_india"
          ]
        },
        p2: {
          type: "object",
          properties: {
            user_rating_out_of_5: {
              type: "number"
            },
            expert_rating_out_of_5: {
              type: "number"
            },
            rating_out_of_100_sp1: {
              type: "object",
              properties: {
                specification_name: {
                  type: "string"
                },
                rating: {
                  type: "number"
                }
              },
              required: [
                "specification_name",
                "rating"
              ]
            },
            rating_out_of_100_sp2: {
              type: "object",
              properties: {
                specification_name: {
                  type: "string"
                },
                rating: {
                  type: "number"
                }
              },
              required: [
                "specification_name",
                "rating"
              ]
            },
            rating_out_of_100_sp3: {
              type: "object",
              properties: {
                specification_name: {
                  type: "string"
                },
                rating: {
                  type: "number"
                }
              },
              required: [
                "specification_name",
                "rating"
              ]
            },
            rating_out_of_100_sp4: {
              type: "object",
              properties: {
                specification_name: {
                  type: "string"
                },
                rating: {
                  type: "number"
                }
              },
              required: [
                "specification_name",
                "rating"
              ]
            },
            rating_out_of_100_sp5: {
              type: "object",
              properties: {
                specification_name: {
                  type: "string"
                },
                rating: {
                  type: "number"
                }
              },
              required: [
                "specification_name",
                "rating"
              ]
            },
            rating_out_of_100_overall: {
              type: "number"
            },
            rating_out_of_100_value_for_money: {
              type: "number"
            }
          },
          required: [
            "user_rating_out_of_5",
            "expert_rating_out_of_5",
            "rating_out_of_100_sp1",
            "rating_out_of_100_sp2",
            "rating_out_of_100_sp3",
            "rating_out_of_100_sp4",
            "rating_out_of_100_sp5",
            "rating_out_of_100_overall",
            "rating_out_of_100_value_for_money"
          ]
        },
        p3: {
          type: "object",
          properties: {
            all_product_details_specifications: {
              type: "object",
              properties: {
                1: {
                  type: "string"
                },
                2: {
                  type: "string"
                },
                3: {
                  type: "string"
                },
                4: {
                  type: "string"
                },
                5: {
                  type: "string"
                }
              },
              required: [
                "1",
                "2",
                "3",
                "4",
                "5"
              ]
            },
            Quick_Take_on_all_specifications: {
              type: "object",
              properties: {
                1: {
                  type: "string"
                },
                2: {
                  type: "string"
                },
                3: {
                  type: "string"
                },
                4: {
                  type: "string"
                },
                5: {
                  type: "string"
                }
              },
              required: [
                "1",
                "2",
                "3",
                "4",
                "5"
              ]
            },
            Overall_verdict_with_pros_cons: {
              type: "object",
              properties: {
                1: {
                  type: "string"
                },
                2: {
                  type: "string"
                },
                3: {
                  type: "string"
                },
                4: {
                  type: "string"
                },
                5: {
                  type: "string"
                },
                6: {
                  type: "string"
                }
              },
              required: [
                "1",
                "2",
                "3",
                "4",
                "5",
                "6"
              ]
            }
          },
          required: [
            "all_product_details_specifications",
            "Quick_Take_on_all_specifications",
            "Overall_verdict_with_pros_cons"
          ]
        },
        p4: {
          type: "object",
          properties: {
            Tag1: {
              type: "string"
            },
            Tag2: {
              type: "string"
            },
            Tag3: {
              type: "string"
            },
            Tag4: {
              type: "string"
            },
            Tag5: {
              type: "string"
            },
            Tag6: {
              type: "string"
            }
          },
          required: [
            "Tag1",
            "Tag2",
            "Tag3",
            "Tag4",
            "Tag5",
            "Tag6"
          ]
        }
      },
      required: [
        "p1",
        "p2",
        "p3",
        "p4"
      ]
    }
  };

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      const result = await model.generateContent({
        contents: [{ role: "user", parts: [{ text: `${systemInstruction}${query}` }] }],
        generationConfig,
      });

      const response = result.response;
      const responseText = response.text();

      try {
        const parsedResponse = JSON.parse(responseText);
        
        if (parsedResponse.p1 && parsedResponse.p1.product_title === "Product information unavailable") {
          return { error: "Product data unavailable. Please try a different search." };
        }
        
        ['p1', 'p2'].forEach(section => {
          if (parsedResponse[section]) {
            Object.keys(parsedResponse[section]).forEach(key => {
              if (typeof parsedResponse[section][key] === 'number' && isNaN(parsedResponse[section][key])) {
                parsedResponse[section][key] = 0;
              }
            });
          }
        });

        return parsedResponse;
      } catch (parseError) {
        console.error("Error parsing JSON response:", parseError);
        console.error("Raw response:", responseText);
        
        if (attempt === MAX_RETRIES) {
          return { error: "Unable to retrieve product information. Please try again." };
        }
      }
    } catch (error) {
      console.error(`Attempt ${attempt + 1} error in product search:`, error);
      
      if (attempt === MAX_RETRIES) {
        return { error: "An error occurred while searching for the product. Please try again." };
        }
    }
  }

  return { error: "Unable to retrieve product information. Please try again later." };
};