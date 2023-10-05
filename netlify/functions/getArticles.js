require("dotenv").config()

const axios = require("axios")

// formats a date in the past (set by days variable) to YYYY-MM-DD format
const formatPastDate = (days) => {
    const fromDate = new Date()
    fromDate.setDate(fromDate.getDate() - days)
    const formattedDate = fromDate.toISOString().split('T')[0]
    return formattedDate
}

exports.handler = async (event, context) => {
    try {
      const { query } = event.queryStringParameters
      const url = `https://newsapi.org/v2/everything?q=${query}` +
        `&language=en` +
        `&pageSize=80` +
        `&from=${formatPastDate(30)}` +
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