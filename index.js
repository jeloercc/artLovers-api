fetch("https://api.artic.edu/api/v1/artworks")
    .then((response) => response.json())
    .then((data) => {
        console.log(data);
        console.log("First artwork title:", data.data[0].title); 
    })
    .catch((error) => {
        console.error("Error fetching data:", error);
    });