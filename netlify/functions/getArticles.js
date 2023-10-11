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
      // const url = `https://newsapi.org/v2/everything?q=${query}` +
      //   `&language=en` +
      //   `&pageSize=80` +
      //   `&from=${formatPastDate(30)}` +
      //   `&sortBy=relevancy` +
      //   `&excludeDomains=slashdot.org` +
      //   `&apiKey=${process.env.NEWS_API_KEY}`
  
      const url = `https://newsdata.io/api/1/news?apikey=${process.env.NEWSDATA_API_KEY}` +
      `&q=${query}` +
      `&language=en` +
      `&country=us` +
      `&image=1` +
      `&excludedomain=dailystar.co.uk,dailymail.co.uk` + 
      `&prioritydomain=top` + 
      `&full_content=1`

      let response = await axios.get(url,
        {
            headers: { Accept: "application/json", "Accept-Encoding": "identity" },
            // params: { trophies: true },
        } 
      )

      let articles = response.data.results
      // console.log('Response from API:', response)
      // console.log(articles)
      return {
        statusCode: 200,
        body: JSON.stringify({ articles }),
      }
    } catch (error) {
      console.log(error)
      return {
        statusCode: 500,
        body: JSON.stringify({ error }), 
      }
    }
  }