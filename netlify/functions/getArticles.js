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
      const { query, category } = event.queryStringParameters

      const url = `http://api.mediastack.com/v1/news?access_key=${process.env.MEDIASTACK_API_KEY}` +
      `&categories=${category}` +
      `&keywords=${query}` +
      `&languages=en` +
      `&countries=us` +
      `&sort=popularity` +
      `&sources=-phys,-nytimes,-science` +
      `&limit=100` 

      let response = await axios.get(url,
        {
            headers: { Accept: "application/json", "Accept-Encoding": "identity" },
            // params: { trophies: true },
        } 
      )

      let articles = response.data.data.filter(article => article.image)
      // console.log('Response from API:', response)
      // console.log(articles)
      return {
        statusCode: 200,
        body: JSON.stringify({ articles }),
      }
    } catch (error) {
      // console.log(error)
      return {
        statusCode: 500,
        body: JSON.stringify({ error }), 
      }
    }
  }