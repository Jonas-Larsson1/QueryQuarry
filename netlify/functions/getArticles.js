require("dotenv").config()

const axios = require("axios")

exports.handler = async (event, context) => {
    try {
      const { query } = event.queryStringParameters
      const url = `https://newsapi.org/v2/everything?q=${query}` +
        `&language=en` +
        `&pageSize=80` +
        `&from=2023-10-01` +
        `&sortBy=relevancy` +
        `&excludeDomains=slashdot.org` +
        `&apiKey=${process.env.NEWS_API_KEY}`
  
      let response = await axios.get(url,
        {
            headers: { Accept: "application/json", "Accept-Encoding": "identity" },
            params: { trophies: true },
        } 
      )

      let articles = response.data.articles
  
      return {
        statusCode: 200,
        body: JSON.stringify({ articles }),
      }
    } catch (error) {
      return {
        statusCode: 500,
        body: JSON.stringify({ error }),
      }
    }
  }