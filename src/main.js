let carsousel;
// index.html ids': nav, content, footer
window.addEventListener('load', function() {
    // loadHtml parms: (id, filename)
    // loadHtml("nav", "__nav__")
    // loadHtml("footer", "__footer__")
    loadContent()
})

function loadContent() {
    let loc = document.URL.split("#")
    if(loc.length === 1 || loc[1] === "home") return loadHtml("content", "about") 

    loadHtml("content", loc[1])
}

function loadHtml(id, filename) {
    let xhttp
    let element = document.getElementById(id)
    let file = filename + '.html'
    clearInterval(carsousel)

    if(file) {
        xhttp = new XMLHttpRequest();
        xhttp.onreadystatechange = function() {
            if(this.readyState === 4) {
                if(this.status === 200) { RunScripts(element, file, this.responseText) }
                if(this.status === 404) { element.innerHTML = "<h1>Page not found.</h1>"}
            }
        }
        xhttp.open('GET', `src/pages/${file}`, true)
        xhttp.send()
        return
    }
}

function RunScripts(element, file, responseText) {
    element.innerHTML = responseText
    if(file === "about.html") { StartCarsousel(25, 3) }
    if(file === "sip.html") { displayStatus() }
    if(file === "boards.html") { GetBoardsInfo() }
    if(file === "projects.html") { GetProjectData() }
}


function AddToString(oldstr, addstr) {
    if(oldstr === "") return addstr
    return `${oldstr}\n${addstr}`
}


function displayStatus() {
    let notStarted=document.getElementsByClassName('not-started')
    let inProgress=document.getElementsByClassName('in-progress')
    let completed=document.getElementsByClassName('completed')
    
    if(notStarted.length>0){
        for(let i=0;i<notStarted.length;i++){
            notStarted[i].innerHTML="(Not Started)"
        }
    }
    if(inProgress.length>0) {
        for(let i=0;i<inProgress.length;i++) {
            inProgress[i].innerHTML="(In Progress)"
        }
    }
    if(completed.length>0){
        for(let i=0;i<completed.length;i++){
            completed[i].innerHTML="(Completed)"
        }
    }
}


// ----------------------------- Projects -----------------------------------
function DisplayProjects(data, keys) {
    let innerHTML = ""
    let columns = ["","","",""]

    let index = 0
    while(index < keys.length) {
        for(let i = 0; i < columns.length; i++) {
            if(index >= keys.length) break
            
            let title = keys[index]
            columns[i] = AddToString(columns[i], DisplayProject(title, data[title]))
            index += 1
        }
    }
    
    for(let i = 0; i < columns.length; i++) { 
        innerHTML = AddToString(innerHTML, `<div class="column">\n${columns[i]}\n</div>`) 
    }
    return innerHTML
}

function DisplayProject(project_title, data) {
    return (
    `\t<div class="img_container">
        <img src="src/img/${data['image']}">
        <div class="project_info inside_center hide">
            <div class="inside_center">
                <h4>${project_title}</h4>
                <p>(${data['project_type']})</p>
            </div>
        </div>
    </div>`)
}

function GetProjectData() {
    fetch("./src/data/projects.json")
    .then(response => {
        return response.json()
    })
    .then(jsondata => {
        let row = document.getElementsByClassName('row')[0]
        let keys = Object.keys(jsondata)

        row.innerHTML = DisplayProjects(jsondata, keys)
    })
}


// --------------------------------------------------------------------------
function StartCarsousel(intervalTime, speed) {
    let pos = 0
    let size = document.getElementsByClassName('logo-container').length * 350 + (intervalTime + speed)
    AddLogoPlaceholders(4)

    carsousel = setInterval(() => {
        let ourCarousel = document.getElementById('carsousel-container')
        ourCarousel.style.transform = 'translate(' + pos + 'px)'
        pos -= speed
        if(pos < -size) pos = 0
    }, intervalTime)
}

function AddLogoPlaceholders(numofPlaceholders) {
    let logos = document.getElementsByClassName('logo-container')
    let ourCarousel = document.getElementById('carsousel-container')
    ourCarousel.style.width = `${(logos.length*350) + (numofPlaceholders*350) + 100}px`

    for (let i = 0; i < numofPlaceholders; i++) {
        ourCarousel.innerHTML += `<div class="logo-container">${logos[i].innerHTML}</div>`
    }
}


// ----------------------------- Boards -------------------------------------
function GetBoardsInfo() {
    fetch("./src/data/boards.json")
    .then(response => {
        return response.json()
    })
    .then(jsondata =>  {
        Object.keys(jsondata).forEach(objective => {
            let description = jsondata[objective]['description']
            let projects = jsondata[objective]['projects']
            let projectsBody = ""
            for(let i=0; i<projects.length; i++) {
                let side = 'left'
                if (i%2 !== 0) { side = "right" }

                projectsBody += `<div class='${side} center-project-info'>${DisplayBoardProject(side, projects[i])}</div>`
            }
            let title = `<h1>${objective}</h1>`
            let titleInfo = `<p>${description}</p>`
            
            let container = document.getElementById("container")
            container.innerHTML += `<section><div class="center-text">${title}${titleInfo}</div>${projectsBody}</section>`
        })
    })
}

function DisplayBoardProject(side, project) {
    let image = `<div class='project-img'><img src='src/img/boards/${project["image"]}' alt='${project["title"]}' /></div>`
    let noLink = ( project['link'] === "" )
    let link = (noLink) ? "" : `<p><a href="${project['link']}" target="_blank">Github repository here</a></p>`
    let paragraph = ""
    for(let i = 0; i < project['description'].length; i++) {
        paragraph +=`<p>&emsp;${project['description'][i]}</p>`
    }
    let projectInfo = `<div class="project-info"><h3>${project['title']}</h3><p>${paragraph}</p><div class="git-link"><div>${link}</div></div></div>`

    if (side === "left") return `${image}${projectInfo}`
    return `${projectInfo}${image}`
}