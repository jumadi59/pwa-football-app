const base_url = "https://api.football-data.org/v2/";
const IdCompetition = 2021;
const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
];
const colors = [
    "red", "green", "orange", "grey", "blue"
];

const fetchApi = (url) => {  
    return fetch(url, { 
        headers: { 
            'X-Auth-Token': 'ee4cd160e05e4a178a91f7360d02fdab' 
        } 
    }); 
}

function status(response) {
    if (response.status !== 200) {
        console.log("Error : " + response.status);
        return Promise.reject(new Error(response.statusText));
    } else {
        return Promise.resolve(response);
    }
}

function json(response) {
    return response.json();
}

function updateNameAlias() {
    var element = document.querySelectorAll('.card');
    element.forEach(v => {
        v.querySelectorAll('li').forEach(h => {
            var e = h.querySelector('div');
            e.innerText = (v.clientWidth < 430) ? e.dataset.alias : e.getAttribute('title');
        });
    });
    element.forEach(v => {
        v.querySelectorAll('.date').forEach(h => {
            var x = h.innerText.split(' ');
            var full = x[0] + ' ' + monthNames[new Date(h.getAttribute('date')).getMonth()] + ' ' + x[x.length - 1];
            var sort = x[0] + ' ' + x[1].substring(0, 3) + ' ' + x[x.length - 1];
            h.innerText = (v.clientWidth < 430) ? sort : full;
        });
    });
}

function parseHttpToHttps(text) {
    return text.replace(/^http:\/\//i, 'https://');
}

function viewHtmlStandings(data) {
    data.standings.forEach(function (standing) {
        var html = `<div class="row">`;
        standing.table.forEach(function (table) {
            var crestUrl = (table.team.crestUrl)?parseHttpToHttps(table.team.crestUrl) : 'images/default-team-badge.png';

            html += `<div class="col s12 l6">
            <div class="card hoverable horizontal">
                <div class="card-image waves-effect waves-block waves-light">
                    <img onerror="imgError(this)" class="badge" src="${crestUrl}">
                </div>
                <div class="card-stacked">
                    <div class="card-content">
                        <a href="match.html?id=${table.team.id}" class="card-title">${table.team.name}</a>
                        <ul>
                            <li><div data-alias="Mtch" title="Matches Played">Matches Played</div><div class="val">${table.playedGames}</div></li>
                            <li><div data-alias="Won" title="Won">Won</div><div class="val">${table.won}</div></li>
                            <li><div data-alias="Dw" title="Draw">Draw</div><div class="val">${table.draw}</div></li>
                            <li><div data-alias="Lt" title="Lost">Lost</div><div class="val">${table.lost}</div></li>
                            <li><div data-alias="G" title="Goal">Goal</div><div class="val">${table.goalsFor}:${table.goalsAgainst}</div></li>
                            <li><div data-alias="Pts" title="Points">Points</div><div class="val">${table.points}</div></li>
                        </ul>
                    </div>
                </div>
            </div>
            </div>`;

            dbTeam.get(table.team.id).then((item) => {
                if (!item) {
                    dbTeam.insert({
                        id: table.team.id,
                        name: table.team.name,
                        star: false,
                        imgBadge: (table.team.crestUrl)?parseHttpToHttps(table.team.crestUrl) : null,
                        created: new Date().getTime()
                    });
                }
            });
        });
        html += '</div>';

        var content = document.querySelector('#' + standing.type.toLowerCase());
        content.innerHTML = html;
    });
    updateNameAlias();
}

function viewHtmlMatch(data) {
    data.matches.forEach(matche => {
        var scoreHome = (matche.score.fullTime.homeTeam == null) ? '-' : matche.score.fullTime.homeTeam;
        var scoreAway = (matche.score.fullTime.awayTeam == null) ? '-' : matche.score.fullTime.awayTeam;
        var date = new Date(matche.utcDate);
        var html = `<div class="col s12 l6">
        <div class="card hoverable horizontal match">
        <div class="card-image left waves-effect waves-block waves-light">
            <img onerror="imgError(this)" class="badge" data-team="${matche.homeTeam.id}"" src="images/default-team-badge.png">
            <a href="team.html?id=${matche.homeTeam.id}" class="title">${matche.homeTeam.name}</a>
        </div>
        <div class="card-stacked">
          <div class="card-content center">
            <span class="date" date="${matche.utcDate}">${date.getDate()} ${monthNames[date.getMonth()]} ${date.getFullYear()}</span>
            <time>${date.getHours()}:${date.getMinutes()}</time>
            <h3 class="score">${scoreHome} : ${scoreAway}</h3>
          </div>
        </div>
        <div class="card-image right waves-effect waves-block waves-light">
            <img onerror="imgError(this)" class="badge" data-team="${matche.awayTeam.id}" src="images/default-team-badge.png">
            <a href="team.html?id=${matche.awayTeam.id}" class="title">${matche.awayTeam.name}</a>
        </div>
    </div></div>`;
        if (matche.competition.id === IdCompetition) {
            var content = document.querySelector('#' + matche.status.toLowerCase() + ' > .row');
            if (content) {
                content.innerHTML = (matche.status.toLowerCase() === 'finished') ? html + content.innerHTML : content.innerHTML + html;
            }
        }
    });
    updateNameAlias();
    document.querySelectorAll('img.badge').forEach(elm => {
        if (elm.dataset.team) {
            dbTeam.get(parseInt(elm.dataset.team)).then((item) => {
                if (item) {
                    elm.setAttribute('src', item.imgBadge);
                }
            });
        }
    });
}

function viewHtmlTeams(data) {
    var html = '<div class="container"><div class="row">';
    data.teams.forEach(team => {
        var crestUrl = (team.crestUrl) ? parseHttpToHttps(team.crestUrl) : 'images/default-team-badge.png';
        html += `<div class="col s6 m4 l3">
                <div class="card team hoverable">
                    <div class="card-image center waves-effect waves-block waves-light">
                        <img onerror="imgError(this)" src="${crestUrl}">
                    </div>
                    <div class="card-content">
                        <a href="team.html?id=${team.id}" class="card-title truncate" title="${team.name}">${team.name}</a>
                    </div>
                </div>
            </div>`;

        dbTeam.get(team.id).then((t) => {
            if (!t) {
                dbTeam.insert({
                    id: team.id,
                    name: team.name,
                    imgBadge: (team.crestUrl)? crestUrl : null,
                    star: false,
                    created: new Date().getTime()
                });
            } else if (!t.imgBadge) {
                dbTeam.update({
                    id: team.id,
                    name: team.name,
                    imgBadge: (team.crestUrl)? crestUrl : null,
                    star: t.star,
                    created: new Date().getTime()
                });
            }
        });
    });
    html += '</div></div>';
    document.querySelector('.body-content').innerHTML = html;
}

function viewHtmlTeam(data) {
    var crestUrl = (data.crestUrl)?parseHttpToHttps(data.crestUrl) : 'images/default-team-badge.png';
    document.querySelector('.team-detail')
        .innerHTML = `<div class="badge-team">
        <img onerror="imgError(this)" class="responsive-img" src="${crestUrl}">
    </div>
    <div class="detail">
        <span>${data.name}</span>
        <a href="#" class="star hide-on-med-and-down"> <i class="material-icons"></i></a>
        <a href="#" class="favorite hide-on-med-and-down"><i class="material-icons"></i></a>
    </div>`;

    var contact = document.querySelector('#contact');
    var cAddress = `<li class="collection-item"><div>Address<span class="secondary-content">${data.address}</span></div></li>`;
    var cPhone = `<li class="collection-item"><div>Phone<a href="tel:${data.phone}" class="secondary-content">${data.phone}</a></div></li>`;
    var cEmail = `<li class="collection-item"><div>Email<a href="mailto:${data.email}" class="secondary-content">${data.email}</a></div></li>`;
    var cWebsite = `<li class="collection-item"><div>Website<a href="${data.website}" class="secondary-content">${data.website}</a></div></li>`;
    contact.innerHTML = `<li class="collection-header"><h5>Contact</h5></li>
    ${(data.address)? cAddress : ''} ${(data.phone)? cPhone : ''} ${(data.email)? cEmail : ''} ${(data.website)? cWebsite : ''}`;

    html = `<li class="collection-header"><h5>Squad</h5></li>`;
    data.squad.forEach((squad, index) => {
        html += `<li class="collection-item avatar">
        <i class="material-icons circle ${colors[index % colors.length]}">person</i>
        <span class="title">${squad.name} ${(squad.shirtNumber) ? '('+squad.shirtNumber+')' : ''}</span>
        <p>${(squad.position)? squad.position : ''}</p>
    </li>`;
    });
    var content = document.querySelector('#squad');
    content.innerHTML = html;

    dbTeam.get(data.id).then((t) => {
        if (!t) {
            dbTeam.insert({
                id: data.id,
                name: data.name,
                imgBadge: (team.crestUrl)? crestUrl : null,
                star: false,
                created: new Date().getTime()
            });
        } else if (!t.imgBadge) {
            dbTeam.update({
                id: data.id,
                name: data.name,
                imgBadge: (team.crestUrl)? crestUrl : null,
                star: t.star,
                created: new Date().getTime()
            });
        }
    });

    checkStar(document.querySelectorAll('.star'));
    checkFavorite(document.querySelectorAll('.favorite'));
}

function getStandings(callback) {

    fetchApi(base_url + "competitions/" + IdCompetition + "/standings")
        .then((response) => {
            callback.success(response);
            return status(response);
        })
        .then(json)
        .then(viewHtmlStandings)
        .catch((e) => {
            console.log('error '+ e);
        });

}

function getMatchById(callback) {
    var urlParams = new URLSearchParams(window.location.search);
    var idParam = urlParams.get("id");
    if (!idParam) {
        return callback.error();
    }

    fetch(base_url + "teams/" + idParam + "/matches", {
            method: 'GET',
            headers: new Headers({
                'X-Auth-Token': 'ee4cd160e05e4a178a91f7360d02fdab'
            }),
        })
        .then((response) => {
            callback.success(response);
            return status(response);
        })
        .then(json)
        .then(viewHtmlMatch)
        .catch((e) => {
            console.log('error '+ e);
            
        });


    dbTeam.get(parseInt(idParam)).then((team) => {
        var c = document.querySelector('.team-detail');
        c.innerHTML = `<div class="badge-team">
        <img onerror="imgError(this)" class="responsive-img" src="${team.imgBadge}">
      </div>
      <div class="detail">
        <span>${team.name}</span>
        <a href="#" class="star hide-on-med-and-down"><i class="material-icons"></i></div></a>`;
    });

    checkStar(document.querySelectorAll('.star'));
}

function getTeams(callback) {

    fetchApi(base_url + "teams")
        .then((response) => {
            callback.success(response);
            return status(response);
        })
        .then(json)
        .then(viewHtmlTeams)
        .catch(callback.error);
}

function getTeamById(callback) {
    var urlParams = new URLSearchParams(window.location.search);
    var idParam = urlParams.get("id");
    if (!idParam) {
        return callback.error();
    }

    fetchApi(base_url + "teams/"+idParam)
        .then((response) => {
            callback.success(response);
            return status(response);
        })
        .then(json)
        .then(viewHtmlTeam)
        .catch((e) => {
            console.log('error '+ e);
        });
}