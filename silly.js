window.onload = () => {
  beginSillyPage()
}

function beginSillyPage() {
  alert("Please hang on, we're getting the reply for you.")
  getAudio((url) => {
    alert("All done, enjoy.");
    playRelpy(url);
  });
}

function getAudio(cb) {
  let nameE = document.querySelector('.name.sub');

  // Get the unique ID from the URL
  const urlParams = new URLSearchParams(window.location.search);
  const uniqueId = urlParams.get('id');
  if(uniqueId == null) {
    console.error(`No id passed to the page.`);
    document.querySelector('main').style.display = 'none';
    document.querySelector('.error').style.display = 'block';
    return;
  }

firebase.database().ref('/users/' + uniqueId).once('value').then(function(snapshot) {
    document.querySelector('.name').innerHTML = snapshot.val();
  });
  

  firebase.database().ref('/promptUsed/' + uniqueId).once('value').then(function(snapshot) {
  	document.querySelector('.prompt').innerHTML = snapshot.val();
  });

  // Get the audio file from Firebase Storage
  const storage = firebase.storage();
  const storageRef = storage.ref();
  const audioRef = storageRef.child(`${uniqueId}.mp3`);
  audioRef.getDownloadURL().then((url) => {
    // Set the audio src to the download URL and play the audio
    cb(url);
  }).catch((error) => {
    // Handle errors
    console.error(`Get audio failed: '${error}'.`);
    document.querySelector('main').style.display = 'none';
    document.querySelector('.error').style.display = 'block';
  });
}

function playRelpy(url) {
  let playBack = document.querySelector("audio");
  playBack.src = url;
  playBack.play();

  let replay = document.querySelector(".go")
  replay.onclick = () => {
    playBack.currentTime = 0;
    playBack.play();
  }
}
