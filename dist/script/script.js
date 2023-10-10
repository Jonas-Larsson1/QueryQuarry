const currentTopic = ''

const handleShowMoreButton = () => {
    const showMoreButtons = document.getElementsByClassName('showMoreButton')
    const pages = document.getElementsByClassName('page')
    const pagesArray = Array.from(pages)
    const buttonsArray = Array.from(showMoreButtons)
    
    let currentPageIndex = 0

    const getCurrentPage = () => {
        return document.getElementById(`page${currentPageIndex}`)
    }

    pagesArray.forEach((page, index) => {
        if (page.id !== `page${currentPageIndex}`) {
            page.classList.toggle('noDisplay')
        } 
    })
    
    buttonsArray.forEach((button, index) => {
        button.addEventListener('click', event => {
            currentPageIndex += 1
            button.style.display = 'none'

            getCurrentPage().classList.toggle('noDisplay')
        })
    })
}

const handleEndlessScroll = () => {
    const pages = document.getElementsByClassName('page')
    const pagesArray = Array.from(pages)
    let currentPageIndex = 0
    let scrollPromptElement = document.getElementById(`scrollPrompt${currentPageIndex}`)
    
    pagesArray.forEach((page, index) => {
        if (page.id !== `page${currentPageIndex + 1}` && page.id !== `page${currentPageIndex}`) {
            page.classList.add('noDisplay')
        } else {
            page.classList.add('noOpacity')
        }
    })

    const showNextPage = () => {
      const nextPageIndex = currentPageIndex + 1
      const nextNextPageIndex = currentPageIndex + 2
      if (nextPageIndex < pagesArray.length) {
        pagesArray[nextPageIndex].classList.remove('noOpacity')
        pagesArray[nextNextPageIndex].classList.remove('noDisplay')
        pagesArray[nextNextPageIndex].classList.add('noOpacity')
        currentPageIndex = nextPageIndex  
      }
      scrollPromptElement = document.getElementById(`scrollPrompt${currentPageIndex}`)
    }
  
    window.addEventListener('scroll', () => {
      const { scrollTop, scrollHeight, clientHeight } = document.documentElement
      if (scrollTop + clientHeight >= scrollHeight - 400) {
        scrollPromptElement.classList.add('noOpacity')
        showNextPage()
      }
    })

    const delay = 1

    setTimeout(() => {
        pagesArray[0].classList.remove('noOpacity')
    }, delay)
}

const saveToSessionStorage = (articles, query) => {
    const articlesString = JSON.stringify(articles)
    sessionStorage.setItem(`${query}_Articles`, articlesString)
}

// creates the article elements on the page based on the article objects it recieves
const displayArticles = (articles, query) => {
    window.scrollTo({ top: 0});

    const hamburgerToggle = document.getElementById('hamburgerToggle')
    const mainSection = document.querySelector('main')
    mainSection.innerHTML = ''
    hamburgerToggle.checked = false
    let mobileLayout = false
    
    let articlesToDisplay, pagesToDisplay
    if (window.innerWidth <= 1000) {
        articlesToDisplay = 1
        pagesToDisplay = 45
        mobileLayout = true
    } else if (window.innerWidth <= 1200) {
        articlesToDisplay = 4
        pagesToDisplay = 9
    } else {
        articlesToDisplay = 5
        pagesToDisplay = 9  
    }

    // articles.forEach((article, index) => {
    let articleCount = 0
    let pageCount = 0

    
    
    for (let i = 0; i < pagesToDisplay; i++) {
        const pageElement = document.createElement('section')
        pageElement.classList.add('page')
        pageElement.id = `page${pageCount}`

        const pageGrid = document.createElement('div')
        pageGrid.classList.add('pageGrid')
        pageElement.appendChild(pageGrid)

        const articlesToDisplayOnThisPage = (i === 0 && articlesToDisplay > 1) ? articlesToDisplay - 1 : articlesToDisplay

        for (let j = 0; j < articlesToDisplayOnThisPage && articleCount < articles.length; j++) {

            

            const article = articles[articleCount]
            // console.log('Article title:', article.title)
            // console.log('Article description', article.description)
            
            const articleElement = document.createElement('article')
            articleElement.classList.add('coolShadow')

            articleElement.innerHTML = `
            <div class="articleCard" style="
            background-image: linear-gradient(
                to bottom, rgba(0, 0, 0, 0.0) 0%,   
                rgba(0, 0, 0, 0.5) 50%, 
                rgba(0, 0, 0, 1) 100%), 
                url('${article.urlToImage}')">

                <h2>${article.title}</h2> 
                <div class="articleCardContent">
                    <p>${article.description}</p>
                    <span class="author">${article.author}</span>
                    <span class="source">Continue reading:&nbsp;<a href="${article.url}" target="_blank">${article.source.name}</a></span>
                </div>
            </div>
            `

            pageGrid.appendChild(articleElement)
            // mainSection.appendChild(articleElement)
            
            
            articleCount += 1
        }
       
        

        mainSection.appendChild(pageElement)

        pageCount += 1

        if (!mobileLayout) {
            const pageCounterElement = document.createElement('div')
            pageCounterElement.classList.add('pageCount')
            pageCounterElement.innerHTML = `
                <p>Page ${pageCount} out of ${pagesToDisplay} </p>
            `
            pageElement.appendChild(pageCounterElement)

        }

        
        if (i + 1 < pagesToDisplay) {
            const scrollPromptElement = document.createElement('p')
            scrollPromptElement.classList.add('scrollPrompt')
            scrollPromptElement.id = (`scrollPrompt${pageCount - 1}`)
            scrollPromptElement.textContent = 'Keep scrolling to show more!'
            pageElement.appendChild(scrollPromptElement)
        }
        

        // if (i + 1 < pagesToDisplay) {

        //     const showMoreButton = document.createElement('button')
        //     showMoreButton.classList.add('showMoreButton')
        //     showMoreButton.textContent = 'Show more!'

        //     pageElement.appendChild(showMoreButton)
        // }


    }
    updateCurrentTopic(query)
    // fillTopicDropdown(defaultTopics)
    const searchInput = document.getElementById('searchInput')
    searchInput.value = ''
    handleEndlessScroll()
    // handleShowMoreButton()
}

// updates the current topic headline
const updateCurrentTopic = (query) => {
    const currentTopicElement = document.getElementById('currentTopic')
    currentTopicElement.textContent = `${query}`
}


const fetchAndDisplayQuery = async (query) => {
    const apiUrl = `/.netlify/functions/getArticles?query=${query}`
    const savedArticlesString = sessionStorage.getItem(`${query}_Articles`)
    let articles 

    if (!savedArticlesString) {
        try {
          const response = await fetch(apiUrl, 
            {
                method: "GET",
                headers: { accept: "application/json" },
            })
    
          const data = await response.json()
      
          articles = data.articles;
          const queryParam = query
          displayArticles(articles, queryParam)
          saveToSessionStorage(articles, queryParam)
          
        } catch (error) {
            console.error('We got an error:', error);
        }
    } else {
        articles = JSON.parse(savedArticlesString)
        displayArticles(articles, query)
    }
}

// const searchForm = document.getElementById('searchForm')
// searchForm.addEventListener('submit', (event) => {
//     event.preventDefault()
//     const searchInput = document.getElementById('searchInput').value
//     fetchAndDisplayQuery(searchInput)
// })

const selectRandomTopic = (topics) => {
  return topics[Math.floor(Math.random() * topics.length)]
}

const defaultTopics = [
    'TECHNOLOGY',
    'SCIENCE',
    'HEALTH',
    'BUSINESS',
    'SPORTS',
    'TRAVEL',
    'FOOD',
    'GAMES'
]

const fillNavbarTopics = (topics) => {
    const navbar = document.getElementById('navbar')
    navbar.innerHTML = ''

    const navList = document.createElement('ul')
    navList.classList.add('navbarList')
   
    navbar.appendChild(navList)

    const hiddenNavItem = document.createElement('div')
    hiddenNavItem.classList.add('hiddenItem', 'noOpacity', 'noDisplay')
    const hiddenNavItem2 = document.createElement('div')
    hiddenNavItem2.classList.add('hiddenItem', 'noOpacity', 'noDisplay')
    navList.appendChild(hiddenNavItem)
    navList.appendChild(hiddenNavItem2)


    for (const topic of topics) {
        const navItem = document.createElement('li')
        navItem.classList.add('navbarItem')
        
        
        const navLink = document.createElement('a')
        navLink.classList.add('navbarLink')
        navLink.classList.add('secondaryButton')
        navLink.href = '#'
        navLink.textContent = topic
        navLink.addEventListener('click', event => {
            event.preventDefault()
            fetchAndDisplayQuery(topic)
        })
        navItem.appendChild(navLink)
        
        navList.appendChild(navItem)
    }
}

const fillTopicDropdown = (topics) => {
    const topicDropDown = document.getElementById('topicDropDown')
    topicDropDown.innerHTML = ''

    const defaultOption = document.createElement('option')
    defaultOption.value = 'none'
    defaultOption.id = 'defaultOption'
    defaultOption.text = 'Example topics'
    defaultOption.selected = true
    defaultOption.disabled = true
    defaultOption.hidden = true
    topicDropDown.appendChild(defaultOption)

    for (const topic of topics) {
        const option = document.createElement('option')
        option.value = topic
        option.text = topic
        topicDropDown.appendChild(option)
    }
}
// calls the api request function when the page is loaded with selected topic
document.addEventListener('DOMContentLoaded', () => {

    const currentTopic = selectRandomTopic(defaultTopics)

    fetchAndDisplayQuery(currentTopic)
    fillNavbarTopics(defaultTopics)


    let currentWindowWidth = window.innerWidth
    let throttled = false
    const thottleDelay = 200
    

    window.addEventListener('resize', event => {
        if (!throttled) {
            let newWindowWidth = window.innerWidth
            if (newWindowWidth !== currentWindowWidth) {
                console.log('new width detected')
                fetchAndDisplayQuery(currentTopic)
                throttled = true
                setTimeout(() => {
                    throttled = false
                }, thottleDelay)
            }
            currentWindowWidth = newWindowWidth
        }
    })

    // gets the input from the search box
    const searchForm = document.getElementById('searchForm')
    searchForm.addEventListener('submit', event => {
        event.preventDefault()
        const searchInput = document.getElementById('searchInput').value

        if (searchInput) {
            fetchAndDisplayQuery(searchInput.toUpperCase())
        }
    })

    // const topicDropDown = document.getElementById('topicDropDown')
    // topicDropDown.addEventListener('change', event => {
    //     const dropDownChoice = event.target.value
    //     fetchAndDisplayQuery(dropDownChoice)

    // })
})


const invokeEdgeFunction = async (action) => {
    const cookieUrl = `/cookies?action=${action}`
  
    try {
      const response = await fetch(cookieUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })
  
      if (!response.ok) {
        throw new Error('Network response was not ok')
      }
  
    
      console.log('Response from edge function:', response.text())
    } catch (error) {
      console.error('Error invoking edge function:', error)
    }
  }

// invokeEdgeFunction()