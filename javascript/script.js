console.log('hey I am working');
let allsongs;
let currentfolder;
let currentsong = new Audio();
function formatTime(time) {
    // Convert time to integer seconds
    let minutes = Math.floor(time / 60);
    let seconds = Math.floor(time % 60);

    // Format the minutes and seconds to ensure two digits
    let formattedMinutes = minutes < 10 ? `0${minutes}` : minutes;
    let formattedSeconds = seconds < 10 ? `0${seconds}` : seconds;

    return `${formattedMinutes}:${formattedSeconds}`;
}
async function songsfetch(folder) {
    const url = `http://127.0.0.1:3000/${folder}/`; // Correct this line if needed

    try {
        let response = await fetch(url);
        let data = await response.text(); // Assuming the server returns JSON
        // console.log(data); // Log the fetched data for debugging

        currentfolder = folder;
        allsongs = [];

        let songelement = document.createElement("div");
        songelement.innerHTML = data; // Assuming `data` contains HTML or can be inserted as such
        let tds = songelement.getElementsByTagName("a");

        for (let index = 0; index < tds.length; index++) {
            const element = tds[index];
            if (element.href.endsWith(".mp3")) {
                allsongs.push(element.href.split(`/${folder}/`)[1]);

            }
        }


        updateSongList(); // Extracted function to update the UI
        return allsongs;

    } catch (error) {
        console.error("Error in fetching songs", error);
        return [];
    }
}

function updateSongList() {
    const title = currentfolder.replaceAll("songs/", " ")

   
    let songsul = document.querySelector(".songlist ul");
    if (songsul) {
        songsul.innerHTML = ''; // Clear existing list
        for (let i = 0; i < allsongs.length; i++) {
            songsul.innerHTML += `
                <li>   
                    <div class="minfo"> 
                        <img class="mplay" src="img/music.svg" alt="">
                        <div class="mminfo">
                            <div class="msongname">${allsongs[i].replaceAll("%20", " ")}</div>
                            <div class="martistname">artist name</div>
                        </div> 
                    </div>
                    <div class="mplaynow">
                        <img src="img/mplaybtn.svg" alt="" class="play-button">
                        <div class="bar-container">
                            <div class="bar"></div>
                            <div class="bar"></div>
                            <div class="bar"></div>
                            <div class="bar"></div>
                        </div>
                    </div>
                </li>`;
        }

        // Add event listeners to play buttons
        Array.from(document.querySelectorAll(".play-button")).forEach((button, index) => {
            button.addEventListener("click", event => {
                event.stopPropagation();
                let trackName = allsongs[index].replaceAll("%20", " ");
                // console.log('Playing:', trackName);
                playMusic(trackName);

                let play_btn = document.querySelector(".play-bt img");
                play_btn.src = "img/pasue-icon.svg";
            });
        });
    }
}

function playMusic(track, pause = false) {
    if (!pause) {
        currentsong.pause();
        currentsong.currentTime = 0;
        currentsong.src = `${currentfolder}/${track}`;
        currentsong.play().catch(error => {
            console.error("Error playing the audio:", error);
        });

        document.querySelector(".pb-title h4").innerHTML = decodeURI(track);

        Array.from(document.querySelectorAll(".songlist li")).forEach((item) => {
            const barContainer = item.querySelector('.bar-container');
            const playIcon = item.querySelector('.mplaynow img');

            if (item.querySelector('.msongname').innerText === decodeURI(track)) {
                barContainer.style.display = 'flex';
                playIcon.style.display = "none";
            } else {
                barContainer.style.display = 'none';
                playIcon.style.display = "flex";
            }
        });
    }
}
async function albumGen() {
    const albumfetch = 'http://127.0.0.1:3000/songs/';

    try {
        const albumsdata = await fetch(albumfetch);
        const albumslist = await albumsdata.text();
        const albumslista = document.createElement("div");
        albumslista.innerHTML = albumslist;
        const album_names = albumslista.getElementsByTagName("a");

        const albumcard_cont = document.querySelector(".playlist-con");
        albumcard_cont.innerHTML = ''; // Clear existing content

        for (let element of album_names) {
            if (element.href.includes("/songs/")) {
                const folder = element.href.split("/").slice(-2)[0]; // Extract folder name
                const infoResponse = await fetch(`http://127.0.0.1:3000/songs/${folder}/info.json`);
                let albumslist = await infoResponse.json();

                // Add album card
                albumcard_cont.innerHTML += `
                    <div data-folder="songs/${folder}" class="popu-songs-card popu-playlist">
                        <div class="img-cont">
                            <img src="/songs/${folder}/cover.jpg" alt="Album Cover">
                        </div>
                        <div class="popu-title">
                            <h5>${albumslist.title}</h5>
                        </div>
                        <div class="popu-songs-artist">
                            ${albumslist.description}
                        </div>
                       <div class="card-ptn">
        <img src="img/mplaybtn.svg" alt="playbutton" class="card-play">
        <!-- <img src="img/mplaybtn.svg" alt="playbutton" class="card-play> -->

</div>
                    </div>`;
            }
        }

        // Add click events to dynamically created elements
        Array.from(document.querySelectorAll(".popu-songs-card")).forEach(card => {
            card.addEventListener("click", async () => {
                const folder = card.getAttribute("data-folder");
                if (folder) {
                    const allsongs = await songsfetch(folder);
                 playMusic(allsongs[0])
                    // Update the library text when an album is selected
                    const title = folder.split("/").slice(-1)[0].replaceAll("_", " ");
                    document.querySelector(".library-icon img").classList.add("library_img")
                    document.querySelector(".library-icon img").src =`${folder}/cover.jpg`;
                    document.querySelector(".library-text").innerHTML = `${title}`;
                } else {
                    console.error("data-folder is missing or undefined for this card.");
                }
            });
        });
    } catch (error) {
        console.error("Error in albumGen function:", error);
    }
}

albumGen();
document.querySelector(".menu-icon").addEventListener("click",()=>{
document.querySelector(".left").style.left = "0px"
})
document.querySelector(".add-library").addEventListener("click",()=>{
    document.querySelector(".left").style.left = "-100vw"   
})

async function popular_songs() {
const popu_songs = fetch(`http://127.0.0.1:3000/songs/`)
try{

}catch(error){
    console.error("Error in loading Popular Songs")
}
    
}


async function main() {
    await songsfetch(`/songs/2000s_Hinidi_song_playlist`);
    if (allsongs.length === 0) {
        console.log("No songs found");
        return;
    }
    playMusic(allsongs[0], true)
    // currentsong.src = allsongs[0];
    document.querySelectorAll('.popu-songs-card').forEach(card => {
        card.addEventListener('click', () => {
            let folder = card.getAttribute('data-folder');
            if (folder) {
                songsfetch(folder);
            } else {
                console.error("Folder data attribute is missing or undefined.");
            }
        });
    });


    // Prevent song list items from playing on click if not on the play button
    Array.from(document.querySelectorAll(".songlist li")).forEach(item => {
        item.addEventListener("click", event => {
            event.stopPropagation();

        });
    });

    const play_btn = document.querySelector(".play-bt img")

    play_btn.addEventListener("click", () => {
        if (currentsong.paused) {

            play_btn.src = "img/pasue-icon.svg"
            // 
            // ok.src = "play-button.svg"
            currentsong.play();

        }
        else {

            play_btn.src = "img/play-button.svg"
            currentsong.pause()
        }
    })


    currentsong.addEventListener("timeupdate", () => {
        // console.log(currentsong.currentTime, currentsong.duration);

        // Format current time and duration
        let formattedCurrentTime = formatTime(currentsong.currentTime);
        let formattedDuration = formatTime(currentsong.duration);

        // Update the DOM element
        document.querySelector(".c-time").innerHTML = `${formattedCurrentTime}/${formattedDuration}`;

        document.querySelector(".seek-circle-br").style.left = (currentsong.currentTime / currentsong.duration) * 97 + "%";
    });

    document.querySelector(".seek-br").addEventListener("click", (e) => {
        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
        document.querySelector(".seek-circle-br").style.left = percent + "%";

        currentsong.currentTime = ((currentsong.duration) * percent) / 100;

    })


    // currentsong.addEventListener("ended", () => {
    //     currentSongIndex++;
    //     if (currentSongIndex >= allsongs.length) {
    //         currentSongIndex = 0; // Loop back to the first song
    //     }
    //     playMusic(allsongs[currentSongIndex]);
    // });

    const preivous_btn = document.querySelector(".previous-bt img");
    const next_btn = document.querySelector(".next-bt img");
    const suffle_btn = document.querySelector(".suffle-btn")
    preivous_btn.addEventListener("click", () => {
        // console.log("you clicked on prevous button")
        let index = allsongs.indexOf(currentsong.src.split("/").slice(-1)[0])

        // console.log(allsongs, index);
        if (index >= 0) {
            playMusic(allsongs[index - 1])
        }
        else {
            playMusic(allsongs[0])
        }


    })


    next_btn.addEventListener("click", () => {
        // console.log("you clicked on next button")
        let index = allsongs.indexOf(currentsong.src.split("/").slice(-1)[0])

        // console.log(allsongs, index);
        if ((index + 1) > length) {
            playMusic(allsongs[index + 1])
        }

    })

    suffle_btn.addEventListener("click", () => {
        // suffle_btn.style.backgroundColor = "red";
        suffle_btn.style.pointerEvents = "none"; // Disable clicking
        suffle_btn.style.userSelect = "none";

        // Re-enable the shuffle button after 6 seconds
        setTimeout(() => {
            suffle_btn.style.backgroundColor = ""; // Reset background color
            suffle_btn.style.pointerEvents = "auto"; // Enable clicking again
            suffle_btn.style.userSelect = "auto";
        }, 0);
        if (currentsong.paused) {

            play_btn.src = "img/pasue-icon.svg"
            // 
            // ok.src = "play-button.svg"
            currentsong.pause();

        }
        else {

            play_btn.src = "img/play-button.svg"
            currentsong.play()
        }
        // Ensure allsongs is defined and not empty
        if (!allsongs || allsongs.length === 0) {
            console.log("No songs available to shuffle.");
            return;
        }

        // Get the current song's index
        let currentSong = currentsong.src.split("/").slice(-1)[0];
        let currentIndex = allsongs.indexOf(currentSong);

        // Ensure we don't get the same song
        let randIndex;
        do {
            randIndex = Math.floor(Math.random() * allsongs.length);
        } while (randIndex === currentIndex);

        // Play the new random song
        playMusic(allsongs[randIndex]);


    });


    document.querySelector(".volume-br input").addEventListener("change", (e) => {

    currentsong.volume = parseInt(e.target.value) / 100;
    })

    document.querySelector(".volume-br img").addEventListener("click",(e)=>{
        if (e.target.src.includes("img/volume-icon.svg")) {
            e.target.src = e.target.src.replace("img/volume-icon.svg",'img/mute.svg');
            currentsong.volume = 0;
            document.querySelector(".volume-br input").value = 0;
        }
        else{
            e.target.src = e.target.src.replace("img/mute.svg","img/volume-icon.svg");
            currentsong.volume = .50;
            document.querySelector(".volume-br input").value = .20;
        }
        // console.log(e);
       
    })

}

main();
