window.addEventListener("DOMContentLoaded", () => {
  const input = document.getElementById("file");
  const wrapper = document.getElementById("wrapper");
  const close = document.getElementById("close");

  close.addEventListener("click", () => {
    wrapper.innerHTML = "";
    input.value = null;
  });

  // input.addEventListener("change", () => {
  //   const files = input.files;
  //   wrapper.innerHTML = "";
  //   for (let i = 0; i < files.length; i++) {
  //     const file = files[i];
  //     const fileType = file.type;
  //     if (fileType.startsWith("image/")) {
  //       const imageUrl = URL.createObjectURL(file);
  //       fileShow(file.name, imageUrl);
  //     } else {
  //       alert("File Harus JPG/PNG/JPEG");
  //     }
  //   }
  // });

  input.addEventListener("change", () => {
    const files = input.files;
    wrapper.innerHTML = "";
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const fileType = file.type;

      if (fileType === "application/pdf") {
        const fileUrl = URL.createObjectURL(file);
        fileShow(file.name, fileUrl);
      } else {
        alert("File harus berformat PDF");
      }
    }
  });

  const fileShow = (fileName, fileUrl) => {
    const showFile = document.createElement("div");
    showFile.classList.add("w-14", "text-black", "h-14", "bg-white", "shadow-md", "rounded-md", "flex-shrink-0");
    const img = document.createElement("img");
    img.classList.add("w-full", "h-full", "object-cover");
    img.src = fileUrl;
    img.alt = fileName;
    showFile.appendChild(img);
    wrapper.appendChild(showFile);
  };
});

document.getElementById("upload-form").addEventListener("submit", function (event) {
  event.preventDefault();
  var formData = new FormData();
  var files = document.getElementById("file").files;
  for (var i = 0; i < files.length; i++) {
    formData.append("file", files[i]);
  }
  fetch("/upload", {
    method: "POST",
    body: formData,
  })
    .then((response) => response.json())
    .then((data) => {
      var plagiarismResultDiv = document.getElementById("plagiarism");
      plagiarismResultDiv.innerHTML = "";
      if (data.error) {
        plagiarismResultDiv.innerText = data.error;
      } else {
        var similarityResults = data.similarity_results;

        var tableHTML = "";

        for (var i = 0; i < similarityResults.length; i++) {
          if (!similarityResults[i].hasOwnProperty("filename")) {
            var file1 = similarityResults[i].file1;
            var file2 = similarityResults[i].file2;
            var similarity = (similarityResults[i].similarity * 100).toFixed(2);

            tableHTML += `<tr class="text-sm">
                <td class="px-2 border-2">Kesamaan file</td>
                <td class="px-2 border-2">${file1}</td>
                <td class="px-2 border-2">dan file</td>
                <td class="px-2 border-2">${file2}</td>
                <td class="px-2 border-2">: ${similarity}%</td>
            </tr>`;
          }
        }

        plagiarismResultDiv.innerHTML = `<table class="w-full border-2" cellpadding="10" cellspacing="10">
        ${tableHTML}
    </table>`;
      }
    })
    .catch((error) => console.error("Error:", error));
});
