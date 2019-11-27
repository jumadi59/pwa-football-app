window.addEventListener('resize', (e) => {
  updateNameAlias();
  checkStar(document.querySelectorAll('.star'));
  checkFavorite(document.querySelectorAll('.favorite'));
});

function loadBottomNav(callback) {
  var xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function () {
    if (this.readyState == 4) {
      if (this.status !== 200) return;
      var body = document.querySelector("body");
      body.insertAdjacentHTML('beforeend', xhttp.responseText);
      var elms = document.querySelectorAll('.bottom-navigation nav a, #nav-mobile a');
      elms.forEach(elm => {
        elm.addEventListener('click', function (event) {
          elms.forEach(e => {
            e.classList.remove('active')
          });
          elm.classList.add('active');
          var page = event.target.getAttribute('href').substr(1);
          loadPage(page, callback);
        });
      });

      var page = window.location.hash.substr(1);
      if (page == '') page = 'standing';
      loadPage(page, callback);

      elms.forEach(elm => {
        if (elm.getAttribute('href').substr(1) === page) {
          elms.forEach(e => {
            e.classList.remove('active')
          });
          elm.classList.add('active');
        }

      });
    }
  };
  xhttp.open("GET", 'bottom-nav.html', true);
  xhttp.send();
}

function loadPage(page, callback) {
  var content = document.querySelector(".body-content");
  var loading = document.querySelector(".loading-content");

  var xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function () {
    loading.classList.add("hide");

    if (this.readyState === 4) {
      if (this.status === 200) {
        content.innerHTML = xhttp.responseText;
        callback.loaded(page);
      } else if (this.status === 404) {
        content.innerHTML = "<h5 class='center-content center'>Halaman tidak ditemukan.</h5>";
      } else {
        content.innerHTML = "<h5 class='center-content center'>Ups.. halaman tidak dapat diakses.</h5>";
      }
    }
  };

  xhttp.open("GET", 'pages/' + page + '.html', true);
  xhttp.send();
  loading.classList.remove("hide");
  content.innerHTML = "";
}

function getAllFavorite(callback) {
  dbFavorite.getAll().then((teams) => {
    if (teams) {
      var html = '';
      teams.forEach(team => {
        html += `<div class="col s6 m4 l3">
                <div class="card team hoverable">
                    <div class="card-image center waves-effect waves-block waves-light">
                        <img onerror="imgError(this)" src="${(team.imgBadge) ? team.imgBadge : 'images/default-team-badge.png'}">
                    </div>
                    <div class="card-content">
                        <a href="team.html?id=${team.id}" class="card-title truncate" title="${team.name}">${team.name}</a>
                    </div>
                </div>
            </div>`;
      });
      html += '';
      document.querySelector('.body-content > .container > .row').innerHTML = html;

      callback.success(teams.length);

    }
  }).catch((e) => {
    console.log('error :' + e);
    callback.error(e);
  });
}

function imgError($this) {
  $this.setAttribute('src', 'images/default-team-badge.png');
}

function clickStar(e) {
  e.preventDefault();

  var urlParams = new URLSearchParams(window.location.search);
  var idParam = parseInt(urlParams.get("id"));
  var icon = this.querySelector('i.material-icons');

  dbTeam.get(idParam).then((team) => {
    if (team) {
      dbTeam.update({
        id: team.id,
        name: team.name,
        imgBadge: team.imgBadge,
        star: !team.star,
        created: new Date().getTime()
      });

      if (!team.star) {
        this.classList.add('active');
        this.setAttribute('title', 'Remove Star');
        icon.innerHTML = 'star';
      } else {
        this.classList.remove('active');
        this.setAttribute('title', 'Add Favorite');
        icon.innerHTML = 'star_border';
      }
    }
  });
}

function clickFavorite(e) {
  e.preventDefault();
  var urlParams = new URLSearchParams(window.location.search);
  var idParam = parseInt(urlParams.get("id"));
  var icon = this.querySelector('i.material-icons');

  dbFavorite.get(idParam).then((item) => {
    if (item) {
      dbFavorite.delete(idParam);
      this.classList.remove('active');
      this.setAttribute('title', 'Add Favorite');
      icon.innerHTML = 'favorite_border';
      M.toast({
        html: 'Berhasi di hapus dari tim favorite'
      });
    } else {
      dbTeam.get(parseInt(idParam)).then((team) => {
        if (team) {
          dbFavorite.insert({
            id: team.id,
            name: team.name,
            imgBadge: team.imgBadge,
            created: new Date().getTime()
          });
          this.classList.add('active');
          this.setAttribute('title', 'Remove Favorite');
          icon.innerHTML = 'favorite';
          M.toast({
            html: 'Berhasil ditambahkan tim favorite!'
          });
        }
      });
    }
  });
}

function checkStar($this) {
  $this.forEach(element => {
    var urlParams = new URLSearchParams(window.location.search);
    var idParam = parseInt(urlParams.get("id"));
    var icon = element.querySelector('i.material-icons');
    if (!idParam) {
      return;
    }

    element.addEventListener('click', clickStar);
    element.addEventListener('mouseover', mouseOverAndOut);
    element.addEventListener('mouseout', mouseOverAndOut);

    dbTeam.get(idParam).then((item) => {
      if (item) {
        if (item.star) {
          element.classList.add('active');
          element.setAttribute('title', 'Remove Star');
          icon.innerHTML = 'star';
        } else {
          element.classList.remove('active');
          element.setAttribute('title', 'Add Star');
          icon.innerHTML = 'star_border';
        }
      }
    });
  });
}

function checkFavorite($this) {
  $this.forEach(element => {
    var urlParams = new URLSearchParams(window.location.search);
    var idParam = parseInt(urlParams.get("id"));
    var icon = element.querySelector('i.material-icons');
    if (!idParam) {
      return;
    }

    element.addEventListener('click', clickFavorite);
    element.addEventListener('mouseover', mouseOverAndOut);
    element.addEventListener('mouseout', mouseOverAndOut);

    dbFavorite.get(idParam).then((item) => {
      if (item) {
        element.classList.add('active');
        element.setAttribute('title', 'Remove Favorite');
        icon.innerHTML = 'favorite';
      } else {
        element.classList.remove('active');
        element.setAttribute('title', 'Add Favorite');
        icon.innerHTML = 'favorite_border';
      }
    });
  });
}

function mouseOverAndOut() {
  if (this.classList.contains('active')) {
    return;
  }
  
  var icon = this.querySelector('i.material-icons');
  var text = icon.innerHTML.split('_');
  if (text.length > 0 && text[1] === 'border') {
    icon.innerHTML = text[0]
  } else {
    icon.innerHTML = text[0] + '_border'
  }
}