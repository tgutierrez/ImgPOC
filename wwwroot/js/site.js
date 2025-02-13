// Please see documentation at https://learn.microsoft.com/aspnet/core/client-side/bundling-and-minification
// for details on configuring this project to bundle and minify static web assets.

// Write your JavaScript code.
(
    () => {
        const width = 320;
        let height = 0;

        const streaming = false;

        let video = null;
        let canvas = null;
        let output = null;
        let startButton = null;

        let dirHandle = null;

        function startup() {
            video = document.getElementById('video');
            canvas = document.getElementById('canvas');
            output = document.getElementById('output');

            startButton = document.getElementById('start-button');

            navigator.mediaDevices
                .getUserMedia({ video: true, audio: false })
                .then((stream) => {
                    video.srcObject = stream;
                    video.play();
                })
                .catch((err) => console.error('${err}'))

            video.addEventListener(
                "canplay",
                (ev) => {
                    if (!streaming) {
                        height = (video.videoHeight / video.videoWidth) * width;
                        video.setAttribute("width", width);
                        video.setAttribute("height", height);
                        canvas.setAttribute("width", width);
                        canvas.setAttribute("height", height);
                        streaming = true;
                    }
                }, false,
            );

            startButton.addEventListener(
                "click",
                async (ev) => {
                    await takePicture();
                    ev.preventDefault();
                }, false,
            );

            clearPhoto();
        }

        function clearPhoto() {
            const context = canvas.getContext("2d");
            context.fillStyle = "#AAA";
            context.fillRect(0, 0, canvas.width, canvas.height);
            const data = canvas.toDataURL("image/png");
            output.setAttribute("src", data);
        }

        async function takePicture() {
            const context = canvas.getContext("2d");
            if (width && height) {
                canvas.width = width;
                canvas.height = height;
                context.drawImage(video, 0, 0, width, height);
                const data = canvas.toDataURL("image/png");
                addPhoto(data);
            } else {
                clearPhoto();
            }
        }

        async function addPhoto(data) {
            let img = document.createElement("img");
            img.setAttribute("src", data);
            output.appendChild(img);
            const file = dataUrlToFile(data, self.crypto.randomUUID() + '.png');
            uploadPhoto(file);
            await saveBlobToFile(file, file.name);
        }

        async function saveBlobToFile(blob, filename) {
            if (dirHandle == null) {
                dirHandle = await window.showDirectoryPicker();
            }
            
            const fileHandle = await dirHandle.getFileHandle(filename, { create: true }); 

            //const fileHandle = await window.showSaveFilePicker({
            //    suggestedName: filename,
            //    types: [{
            //        description: 'Image file',
            //        accept: { 'image/*': ['.png'] }
            //    }]
            //});

            const writable = await fileHandle.createWritable();
            await writable.write(blob);
            await writable.close();
        }

        function uploadPhoto(file) {

            const formData = new FormData();
            formData.append('file', file);

            // Send:
            fetch('/upload', {
                method: 'POST',
                body: formData
            })
            .then(response => response.json())
            .then(data => {
                console.log('Upload Successful:', data);
            })
            .catch(error => {
                console.error('Upload failed:', error);
            });
        }

        function dataUrlToFile(dataUrl, filename) {
            const arr = dataUrl.split(',');
            const mime = arr[0].match(/:(.*?);/)[1]; // "image/png"
            const bstr = atob(arr[1]);
            let n = bstr.length;
            const u8arr = new Uint8Array(n);
            while (n--) {
                u8arr[n] = bstr.charCodeAt(n);
            }
            return new File([u8arr], filename, { type: mime });
        }

        window.addEventListener("load", startup, false);
    }
)();