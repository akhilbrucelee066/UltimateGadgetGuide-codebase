const API_KEY = "";
const API_HOST = "google-news22.p.rapidapi.com";

export const fetchNews = (tab) => {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.withCredentials = true;

    xhr.addEventListener("readystatechange", function () {
      if (this.readyState === this.DONE) {
        if (this.status === 200) {
          try {
            const response = JSON.parse(this.responseText);
            resolve(response);
          } catch (error) {
            reject(new Error("Failed to parse response data"));
          }
        } else {
          reject(new Error(`HTTP error! status: ${this.status}`));
        }
      }
    });

    const country = tab === "Local" ? "in" : "us";
    xhr.open(
      "GET",
      `https://${API_HOST}/v1/topic-headlines?country=${country}&language=en&topic=technology`
    );
    xhr.setRequestHeader("x-rapidapi-key", API_KEY);
    xhr.setRequestHeader("x-rapidapi-host", API_HOST);

    xhr.send();
  });
};