let currentCategory = 'GENERAL'
let currentQuery = ''

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

const saveToSessionStorage = (articles, query, category) => {
    const articlesString = JSON.stringify(articles)
    sessionStorage.setItem(`Category:${category}_Query:${query}`, articlesString)
}

// creates the article elements on the page based on the article objects it recieves
const displayArticles = (articles, query) => {
    window.scrollTo({ top: 0});

    const hamburgerToggle = document.getElementById('hamburgerToggle')
    const mainSection = document.querySelector('main')
    mainSection.innerHTML = ''
    hamburgerToggle.checked = false
    let mobileLayout = false
    
    let articlesPerPage
    if (window.innerWidth <= 1000) {
        articlesPerPage = 1
        mobileLayout = true
    } else if (window.innerWidth <= 1200) {
        articlesPerPage = 4
    } else {
        articlesPerPage = 5
    }

    let totalPages = Math.floor(articles.length / articlesPerPage)

    let articleCount = 0
    let pageCount = 0

    console.log(articles.length)
    console.log(articlesPerPage)
    console.log(totalPages)
    
    for (let i = 0; i < totalPages; i++) {
        const pageElement = document.createElement('section')
        pageElement.classList.add('page')
        pageElement.id = `page${pageCount}`

        const pageGrid = document.createElement('div')
        pageGrid.classList.add('pageGrid')
        pageElement.appendChild(pageGrid)

        const articlesPerPageOnThisPage = (i === 0 && articlesPerPage > 1) ? articlesPerPage - 1 : articlesPerPage

        for (let j = 0; j < articlesPerPageOnThisPage && articleCount < articles.length; j++) {
            const article = articles[articleCount]
            // console.log('Article title:', article.title)
            // console.log('Article description', article.description)
            
            let author = article.author
            let description = article.description

            if (!article.author) {
                author = ""
            }

            if (description.length > 200) {
                description = description.slice(0, 200) + '...'
            } 

            const articleElement = document.createElement('article')
            articleElement.classList.add('coolShadow')

            articleElement.innerHTML = `
            <div class="articleCard" style="
            background-image: linear-gradient(
                to bottom, rgba(0, 0, 0, 0.0) 0%,   
                rgba(0, 0, 0, 0.5) 50%, 
                rgba(0, 0, 0, 1) 100%), 
                url('${article.image}')">

                <h2>${article.title}</h2> 
                <div class="articleCardContent">
                    <p>${description}</p>
                    <span class="author">${author}</span>
                    <span class="source">Continue reading:&nbsp;<a href="${article.url}" target="_blank">${article.source}</a></span>
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
                <p>Page ${pageCount} out of ${totalPages} </p>
            `
            pageElement.appendChild(pageCounterElement)

        }

        
        if (i + 1 < totalPages) {
            const scrollPromptElement = document.createElement('p')
            scrollPromptElement.classList.add('scrollPrompt')
            scrollPromptElement.id = (`scrollPrompt${pageCount - 1}`)
            scrollPromptElement.textContent = 'Keep scrolling to show more!'
            pageElement.appendChild(scrollPromptElement)
        }
        

        // if (i + 1 < totalPages) {

        //     const showMoreButton = document.createElement('button')
        //     showMoreButton.classList.add('showMoreButton')
        //     showMoreButton.textContent = 'Show more!'

        //     pageElement.appendChild(showMoreButton)
        // }


    }
    // fillCategoryDropdown(defaultCategories)
    const searchInput = document.getElementById('searchInput')
    searchInput.value = ''
    handleEndlessScroll()
    // handleShowMoreButton()
}

// updates the current category headline
const updateCurrentCategory = (query,category) => {
    const currentCategoryElement = document.getElementById('currentCategory')
    const currentQueryElement = document.getElementById('currentQuery')
    
    const navbarLinks = document.querySelectorAll('.navbarLink');
    navbarLinks.forEach(link => {
        link.classList.remove('selected');
    });
    const activeNavLink = document.querySelector(`.navbarLink[data-category="${category.toLowerCase()}"]`)
    activeNavLink.classList.add('selected')

    if (!currentQueryElement.textContent) {
        currentQueryElement.textContent = 'No query entered'
    } else {
        currentQueryElement.textContent = `${query.toUpperCase()}`
    }
    currentCategoryElement.textContent = `${category.toUpperCase()}`
}


const fetchAndDisplayQuery = async (query, category) => {
    const lowercaseCategory = category ? category.toLowerCase() : ''
    const apiUrl = `/.netlify/functions/getArticles?query=${query}&category=${lowercaseCategory}`

    const savedArticlesString = sessionStorage.getItem(`Category:${category}_Query:${query}`)
    let articles 

    if (!savedArticlesString) {
        try {
          const response = await fetch(apiUrl, 
            {
                method: "GET",
                headers: { accept: "application/json" },
            })
    
          const data = await response.json()
          
          articles = data.articles



        } catch (error) {
            console.error('We got an error:', error);
        }
    } else {
        articles = JSON.parse(savedArticlesString)
    }

    displayArticles(articles, query)
    saveToSessionStorage(articles, query, category)
    updateCurrentCategory(query,category)
    currentCategory = category.toUpperCase()
}

// const searchForm = document.getElementById('searchForm')
// searchForm.addEventListener('submit', (event) => {
//     event.preventDefault()
//     const searchInput = document.getElementById('searchInput').value
//     fetchAndDisplayQuery(searchInput)
// })

const selectRandomCategory = (categories) => {
  return categories[Math.floor(Math.random() * categories.length)]
}

const defaultCategories = [
    'GENERAL',
    'BUSINESS',
    'ENTERTAINMENT',
    'HEALTH',
    'SCIENCE',
    'SPORTS',
    'TECHNOLOGY'
]

const fillNavbarCategories = (categories) => {
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


    for (const category of categories) {
        const navItem = document.createElement('li')
        navItem.classList.add('navbarItem')
        
        
        const navLink = document.createElement('a')
        navLink.classList.add('navbarLink')
        navLink.classList.add('secondaryButton')
        navLink.href = '#'
        navLink.textContent = category
        navLink.setAttribute('data-category', category.toLowerCase())

        navLink.addEventListener('click', event => {
            event.preventDefault()
            fetchAndDisplayQuery('', category)
        })
        navItem.appendChild(navLink)
        
        navList.appendChild(navItem)
    }
}

const fillCategoryDropdown = (categories) => {
    const categoryDropDown = document.getElementById('categoryDropDown')
    categoryDropDown.innerHTML = ''

    const defaultOption = document.createElement('option')
    defaultOption.value = 'none'
    defaultOption.id = 'defaultOption'
    defaultOption.text = 'Example categories'
    defaultOption.selected = true
    defaultOption.disabled = true
    defaultOption.hidden = true
    categoryDropDown.appendChild(defaultOption)

    for (const category of categories) {
        const option = document.createElement('option')
        option.value = category
        option.text = category
        categoryDropDown.appendChild(option)
    }
}
// calls the api request function when the page is loaded with selected category
document.addEventListener('DOMContentLoaded', () => {

    fillNavbarCategories(defaultCategories)
    fetchAndDisplayQuery('',currentCategory)


    let currentWindowWidth = window.innerWidth
    let throttled = false
    const thottleDelay = 200
    

    window.addEventListener('resize', event => {
        if (!throttled) {
            let newWindowWidth = window.innerWidth
            if (newWindowWidth !== currentWindowWidth) {
                // console.log('new width detected')
                fetchAndDisplayQuery('',currentCategory)
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
            currentQuery = searchInput
            currentCategory = 'GENERAL'
            fetchAndDisplayQuery(searchInput.toUpperCase(),currentCategory)
        }
    })

    // const categoryDropDown = document.getElementById('categoryDropDown')
    // categoryDropDown.addEventListener('change', event => {
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


// need to limit amount of pages based on how many results you get
// fix no query entered bug