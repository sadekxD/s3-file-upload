async function submitForm(e) {
  e.preventDefault();

  // Get the selected file
  const fileInput = document.getElementById("file");
  const file = fileInput.files[0];

  // Check if a file is selected
  if (!file) {
    alert("Please select a file.");
    return;
  }

  // Request pre-signed URL from the server
  const response = await fetch("http://localhost:3000/s3", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ contentType: file.type }),
  });

  if (response.ok) {
    const data = await response.json();
    console.log(data);

    // Upload the file to S3 using the pre-signed URL
    const formData = new FormData();
    Object.entries(data.fields).forEach(([key, value]) => {
      formData.append(key, value);
    });
    formData.append("file", file);

    try {
      const uploadResponse = await fetch(data.url, {
        method: "POST", // Use PUT instead of POST
        body: formData,
      });

      if (uploadResponse.ok) {
        alert("Upload successful!");
      } else {
        console.error("S3 Upload Error:", uploadResponse);
        alert("Upload failed.");
      }
    } catch (error) {
      console.log(error);
    }
  } else {
    alert("Failed to get pre-signed URL.");
  }
}

document.querySelector("#s3-form").addEventListener("submit", submitForm);
