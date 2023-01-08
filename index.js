window.onload = () => {
  beginSite();
};

function beginSite() {
  let prompt = parseUrl(window.location.href).prompt;
  let p = document.querySelector(".bord");
  if (prompt) {
    p.innerHTML = prompt.normalize();
  } else {
    randomQuestion(p);
  }

  p.onclick = () => {
    window.location.href = `/index.html?prompt=${encodeURIComponent(prompt)}`;
  };
  counter();
}

function randomQuestion(p) {
  const firestore = firebase.firestore();

  // Retrieve prompts
  firestore.collection("prompts").get().then((snapshot) => {
    const questions = snapshot.docs.map((doc) => doc.data().question);
    // Pick a random question
    const index = Math.floor(Math.random() * questions.length);
    const question = questions[index];

    p.innerHTML = question;
  })
    .catch((error) => {
      console.error(`Retrieve prompts failed: '${error}'.`);
    });
}
function parseUrl(url) {
  const urlParams = {};
  const searchParams = new URLSearchParams(url.split("?")[1]);
  searchParams.forEach((value, key) => {
    urlParams[key] = value;
  });
  return urlParams;
}

let mediaRecorder = null;
function counter() {
  let goBtn = document.querySelector("button");
  let count = 2;
  let countingFn = null;

  goBtn.onclick = () => {
    if (countingFn == "s") {
      if (localStorage.getItem("first-time")) {
        uploadAudio(null, localStorage.getItem("name"));
        mediaRecorder.stop();
      } else {
        handleModal();
      }
    } else {
      handleRecord(() => {
        countingFn = setInterval(() => {
          if (count != -1) {
            goBtn.innerHTML = count;
            count--;
          } else {
            clearInterval(countingFn);
            countingFn = "s";
            goBtn.innerHTML = `
            	                <svg width="97px" height="97px" viewBox="0 0 97 97" version="1.1" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns="http://www.w3.org/2000/svg" id="share-svg">
            	                  <defs>
            	                    <path d="M0 0L97 0L97 97L0 97L0 0Z" id="path_1" />
            	                    <clipPath id="mask_1">
            	                      <use xlink:href="#path_1" />
            	                    </clipPath>
            	                  </defs>
            	                  <g id="Share-icon">
            	                    <path d="M0 0L97 0L97 97L0 97L0 0Z" id="Background" fill="#FFFFFF" fill-opacity="0" fill-rule="evenodd" stroke="none" />
            	                    <g clip-path="url(#mask_1)">
            	                      <path d="M72.75 8.08331C66.1014 8.08331 60.625 13.5597 60.625 20.2083C60.625 20.9801 60.7131 21.7325 60.8539 22.466L32.0176 39.2878C29.9024 37.498 27.2088 36.375 24.25 36.375C17.6014 36.375 12.125 41.8514 12.125 48.5C12.125 55.1486 17.6014 60.625 24.25 60.625C27.2088 60.625 29.9024 59.502 32.0176 57.7121L60.8539 74.5261C60.7121 75.2619 60.625 76.0172 60.625 76.7916C60.625 83.4402 66.1014 88.9166 72.75 88.9166C79.3986 88.9166 84.875 83.4402 84.875 76.7916C84.875 70.1431 79.3986 64.6666 72.75 64.6666C69.7894 64.6666 67.0981 65.7956 64.9824 67.5874L36.1461 50.7576C36.2869 50.0242 36.375 49.2717 36.375 48.5C36.375 47.7282 36.2869 46.9758 36.1461 46.2423L64.9824 29.4205C67.0976 31.2103 69.7912 32.3333 72.75 32.3333C79.3986 32.3333 84.875 26.8569 84.875 20.2083C84.875 13.5597 79.3986 8.08331 72.75 8.08331L72.75 8.08331ZM72.75 16.1666C75.03 16.1666 76.7916 17.9283 76.7916 20.2083C76.7916 22.4883 75.03 24.25 72.75 24.25C70.47 24.25 68.7083 22.4883 68.7083 20.2083C68.7083 17.9283 70.47 16.1666 72.75 16.1666L72.75 16.1666ZM24.25 44.4583C26.53 44.4583 28.2916 46.22 28.2916 48.5C28.2916 50.78 26.53 52.5416 24.25 52.5416C21.97 52.5416 20.2083 50.78 20.2083 48.5C20.2083 46.22 21.97 44.4583 24.25 44.4583L24.25 44.4583ZM72.75 72.75C75.03 72.75 76.7916 74.5116 76.7916 76.7917C76.7916 79.0717 75.03 80.8333 72.75 80.8333C70.47 80.8333 68.7083 79.0717 68.7083 76.7917C68.7083 74.5116 70.47 72.75 72.75 72.75L72.75 72.75Z" id="Shape" fill="#00FF0F" fill-rule="evenodd" stroke="none" />
            	                    </g>
            	                  </g>
            	                </svg>`;
            // preview();
            mediaRecorder.pause();
          }
        }, 1000);
      });
    }
  };
}

function handleRecord(cb) {
  navigator.mediaDevices.getUserMedia({ audio: true }).then(
    (stream) => {
      mediaRecorder = new MediaRecorder(stream);
      mediaRecorder.start();
      cb();
    },
    (err) => {
      console.error(`Access microphone failed: '${err}'.`);
    }
  );
}
function preview() {
  mediaRecorder.addEventListener("pause", (event) => {
    // Create a Blob from the recorded audio data
    const audioBlob = new Blob([event.data], { type: "audio/mpeg" });
    let audio = document.querySelector("audio");
    audio.src = URL.createObjectURL(audioBlob);
    audio.play();
  });
}

function handleModal() {
  let modal = document.querySelector("div.modal");
  modal.style.display = "grid";

  let share = document.querySelector(".share-btn");
  let inputs = document.querySelectorAll(".proceed input");

  share.onclick = () => {
    let name = inputs[0].value;
    let email = inputs[1].value;
    localStorage.setItem("name", name);
    localStorage.setItem("first-time", false);
    uploadAudio(email, name);
    modal.style.display = "none";
    mediaRecorder.stop();
  };
}

function uploadAudio(email, name) {
var updates = {};
  updates['/email/' + email] = name;
   firebase.database().ref().update(updates);

  if (email != null) {
    fEref.set({
      email: email,
      name: name,
    }).then(() => {
      console.log("Email added to Firestore");
    }).catch((error) => {
      console.error(`Set email failed: '${error}'.`);
    });
  }

  alert("Please wait a bit. We're uploading your audio. We'll tell you when we are done.")
  mediaRecorder.addEventListener("dataavailable", (event) => {
    const audioBlob = new Blob([event.data], { type: "audio/mpeg" });

    const expiryDate = new Date();
    expiryDate.setHours(expiryDate.getHours() + 24);

    const metadata = {
      customMetadata: {
        expiry: expiryDate.toISOString(),
      },
    };

    // Generate a unique ID
    const database = firebase.database();
    const ref = database.ref().push();
    const uniqueId = ref.key;

    // Add the name and unique ID to the Firestore database
    
    updates = {};
  updates['/users/' + uniqueId] = name;
  firebase.database().ref().update(updates);

updates = {};
  updates['/promptUsed/' + uniqueId] = document.querySelector(".prompt").innerHTML;
  firebase.database().ref().update(updates);

alert('Begin upload')
    // Upload the audio to Firebase Storage
    firebase.storage().ref(`${uniqueId}.mp3`).put(audioBlob, metadata).then((snapshot) => {
      alert("Audio uploaded to SYS successfully.")
      console.log("Audio uploaded successfully");
    });

    // Share silly
    if (navigator.share) {

      navigator.share({
        title: "I DID THE SYS TREND",
        text: `Hi guys, I tried the SYS trend. \n I answered the question ${document.querySelector(".bord").innerHTML}. #shareyoursillytrend #viral #trending`,
        url: `https://shareyoursilly.web.app/silly.html?id=${encodeURIComponent(uniqueId)}`,
      }).then(() => {
        console.log("Link shared");
      }).catch((error) => {
        console.error(`Share failed: '${error}'.`);
      });
    } else {
      console.error(`Web API not supported.`);
    }
  });
}
