// Can't pull JSON from PURE using GET - only XML, which isn't cross-domain.
// So we're using local copies of JSON API responses for this demo.

// name is just display text for the demo selector
// file = contents of JSON resposnse from Pure persons API
// rss = content of RSS feed for publications
let profiles = {
    Jeff: {
        name: "Jeff",
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

loadProfileData = (profileFile) => {
    // Hide headers by default, in case we have no content:
    document.getElementById("researchHeader").style.display = "none";
    document.getElementById("teachingHeader").style.display = "none";
    document.getElementById("publicationsHeader").style.display = "none";

    // Clear out any existing text:
    document.getElementById("research").innerHTML = "";
    document.getElementById("teaching").innerHTML = "";
    document.getElementById("bio").innerHTML = "";

    // Person template:
    let person = {
        name: false,
        email: false,
        job: false,
        photo: false,
        bio: false,
        research: false,
        teaching: false,
        orcid: false,
        unit: false
    }

    // Use jQuery's getJSON to load the JSON from file:

    fetch(profileFile)
        .then(response => response.text())
        .then((json) => {
            data = JSON.parse(json);
            console.log(data);
            person.name = `${data.name.firstName} ${data.name.lastName}`;
            person.email = data.staffOrganisationAssociations[0].emails[0].value.value;
            person.job = data.staffOrganisationAssociations[0].jobDescription.text[0].value;
            person.orcid = data.orcid;
            person.unit = data.staffOrganisationAssociations[0].organisationalUnit.name.text[0].value;
            if(Array.isArray(data.profilePhotos)) {
                person.photo = data.profilePhotos[0].url;
            }
            data.profileInformations.forEach((pinfo) => {
                switch(pinfo.type.uri) {
                    case "/dk/atira/pure/person/customfields/biography":
                        person.bio = pinfo.value.text[0].value;
                        break;
                    case "/dk/atira/pure/person/customfields/researchinterests":
                        person.research = pinfo.value.text[0].value;
                        break;
                    case "/dk/atira/pure/person/customfields/teaching_interests":
                        person.teaching = pinfo.value.text[0].value;
                        break;
                }
            });
            console.log(person);
            document.getElementById("name").innerText = person.name;
            document.getElementById("job").innerText = person.job;
            document.getElementById("email").innerHTML = `<a href="mailto:${person.email}">${person.email}</a>`;
            document.getElementById("photo").innerHTML = `<img src=${person.photo}></img>`;
            document.getElementById("unit").innerText = person.unit;
            if(person.orcid) {
                document.getElementById("orcid").innerHTML = `ORCID: <a href="https://orcid.org/${person.orcid}">${person.orcid}</a>`;
            }
            if(person.bio) {
                document.getElementById("bio").innerHTML = person.bio;
            }
            if(person.research) {
                document.getElementById("research").innerHTML = person.research;
                document.getElementById("researchHeader").style.display="block";
            }
            if(person.teaching) {
                document.getElementById("teaching").innerHTML = person.teaching;
                document.getElementById("teachingHeader").style.display="block";
            }
    });
}

loadRSS = (rssFeed) => {
    // Clear out any existing feed content:
    document.getElementById("publications").innerHTML = "";

    let items = [];

    fetch(rssFeed)
        .then(response => response.text())
        .then(str => new window.DOMParser().parseFromString(str, "text/xml"))
        .then(data => {
            let pubsLink = data.querySelector("link").textContent;
            data.querySelectorAll("item").forEach((i) => {
                let year = parseInt(i.querySelector("pubDate").textContent.substring(12, 16));
                let title = i.querySelector("title").textContent;
                let link = i.querySelector("link").textContent;
                if (year in items) {
                    items[year].push({
                        title: title,
                        link: link
                    })
                } else {
                    items[year] = [
                        {
                            title: title,
                            link: link
                        }
                    ];
                }
            });
            if(items.length) {
                document.getElementById("publicationsHeader").style.display="block";
                document.getElementById("publications").insertAdjacentHTML(
                    "beforeend",
                    `<div id="pubsLink"><a href="${pubsLink}">&raquo; View all publications on Pure</a></div>`
                );
                let years = Object.keys(items).sort().reverse();
                years.forEach((year) => {
                    document.getElementById("publications").insertAdjacentHTML(
                        "beforeend",
                        `<h3 class="itemsYear">${year}</h3>`
                    );
                    items[year].forEach((item) => {
                        document.getElementById("publications").insertAdjacentHTML(
                            "beforeend",
                            `<div class="rssItem"><a href="${item.link}">${item.title}</a></div>`
                        );
                    })
                });
            }
        });
}

switchProfile = (name) => {
    loadProfileData(profiles[name].file);
    loadRSS(profiles[name].rss);
}

// Build the profile picker:
Object.keys(profiles).forEach((profile) => {
    let pp = document.getElementById("profilePicker");
    let newOption = document.createElement('option');
    // create text node to add to option element (opt)
    newOption.appendChild(document.createTextNode(profiles[profile].name));
    newOption.value = profiles[profile].name;
    pp.appendChild(newOption);
});
document.getElementById("profilePicker").onchange = function () {
    switchProfile(this.options[this.selectedIndex].value)
}

// Kick off with Jeff:
switchProfile("Jeff");