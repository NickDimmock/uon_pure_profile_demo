// Can't pull JSON from PURE using GET - only XML, which isn't cross-domain.
// So we're using local copies of JSON API responses for this demo.

let headers = {
    bio: "Biography",
    research: "Research Interests",
    teaching: "Teaching Interests",
    pubs: "Publications"
}

let profiles = {
    Jeff: {
        name:"Jeff",
        file: "jeff.json",
        rss: "rss_jeff.xml"
    },
    Scott: {
        name: "Scott",
        file: "scott.json",
        rss: "rss_scott.xml"
    },
    Richard: {
        name: "Richard",
        file: "richard.json",
        rss: "rss_richard.xml"
    }
}

function loadProfileData(profileFile) {
    let person = {
        name: false,
        email: false,
        job: false,
        photo: false,
        bio: false,
        research: false,
        teaching: false
    }

    $.getJSON(profileFile, function(data) {
        console.log(data);
        person.name = `${data.name.firstName} ${data.name.lastName}`;
        person.email = data.staffOrganisationAssociations[0].emails[0].value.value;
        person.job = data.staffOrganisationAssociations[0].jobDescription.text[0].value;
        if(Array.isArray(data.profilePhotos)) {
            person.photo = data.profilePhotos[0].url;
        }
        _.forEach(data.profileInformations, function(pi) {
            switch(pi.type.uri) {
                case "/dk/atira/pure/person/customfields/biography":
                    person.bio = pi.value.text[0].value;
                    break;
                case "/dk/atira/pure/person/customfields/researchinterests":
                    person.research = pi.value.text[0].value;
                    break;
                case "/dk/atira/pure/person/customfields/teaching_interests":
                    person.teaching = pi.value.text[0].value;
                    break;
            }
        });
        console.log(person);
        document.getElementById("name").innerText = person.name;
        document.getElementById("job").innerText = person.job;
        document.getElementById("email").innerHTML = `<a href="mailto:${person.email}">${person.email}</a>`;
        document.getElementById("photo").innerHTML = `<img src=${person.photo}></img>`;
        if(person.bio) {
            document.getElementById("bio").innerHTML = `<h2>${headers.bio}</h2>${person.bio}`;
        }
        if(person.research) {
            document.getElementById("research").innerHTML = `<h2>${headers.research}</h2>${person.research}`;
        }
        if(person.teaching) {
            document.getElementById("teaching").innerHTML = `<h2>${headers.teaching}</h2>${person.teaching}`;
        }
    });
}

loadRSS = (rssFeed) => {
    document.getElementById("publications").innerHTML = "";
    $.get(rssFeed, function(data) {
        let xml = $(data);
        let items = [];
        let pubsLink = xml.find("link:first")[0].innerHTML;
        pubsLink = pubsLink.replace("?format=rss", "");
        xml.find("item").each(function() {
            items.push({
                    title: $(this).find("title").text(),
                    link: $(this).find("link").text(),
                    description: $(this).find("description").text(),
                    pubDate: $(this).find("pubDate").text(),
                    author: $(this).find("author").text()
            });
        });
        if (items.length) {
            document.getElementById("publications").insertAdjacentHTML(
                "beforeend",
                "<h2>Publications</h2>"
            );
            document.getElementById("publications").insertAdjacentHTML(
                "beforeend",
                `<div id="pubsLink"><a href="${pubsLink}">&raquo; View all publications on Pure</a></div>`
            );
            _.each(items, function(item) {
                document.getElementById("publications").insertAdjacentHTML(
                    "beforeend", 
                    `<li class="rssItem"><a href="${item.link}">${item.title}</a></li>`
                );
            });
        }
    });
}

switchProfile = (name) => {
    loadProfileData(profiles[name].file);
    loadRSS(profiles[name].rss);
}

Object.keys(profiles).forEach(function(profile) {
    let pp = document.getElementById("profilePicker");
    let newOption = document.createElement('option');
    // create text node to add to option element (opt)
    newOption.appendChild(document.createTextNode(profiles[profile].name));
    newOption.value = profiles[profile].name;
    pp.appendChild(newOption);
});
let d = document.getElementById("profilePicker");
d.onchange = function(){
    switchProfile(this.options[this.selectedIndex].value)
}
switchProfile("Jeff");