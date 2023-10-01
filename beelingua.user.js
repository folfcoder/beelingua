// ==UserScript==
// @name         Beelingua Helper
// @namespace    https://github.com/folfcoder/beelingua
// @downloadURL  https://github.com/folfcoder/beelingua/raw/main/beelingua.user.js
// @updateURL    https://github.com/folfcoder/beelingua/raw/main/beelingua.user.js
// @version      0.2
// @description  Show answer keys for Beelingua.
// @author       Kai Folf
// @match        https://newbinusmaya.binus.ac.id/beelingua/*
// @grant        GM_log
// ==/UserScript==

(function () {
    "use strict";

    // Constants
    const ENDPOINT = "https://beelingua.folfcoder.workers.dev";

    // Variables
    let lang, course, unit, number;

    // Function to extract information from the page
    function extractInfo() {
        const unitElem = document.querySelector("h5");
        const unitText = unitElem.textContent;
        GM_log(unitText);

        const [langPart, titlePart, unitPart] = unitText.split(" - ");
        lang = langPart.split("-")[0].trim();
        course = langPart.split("-")[1].trim();
        unit = unitPart.trim();

        GM_log("[DEBUG] Bahasa: " + lang);
        GM_log("[DEBUG] Course: " + course);
        GM_log("[DEBUG] Unit: " + unit);
    }

    // Function to fetch and highlight answers
    function fetchAndHighlightAnswers() {
        const elements = document.querySelectorAll(".secondary-color");
        elements.forEach((element) => {
            const newNum = parseInt(element.textContent);
            if (!isNaN(newNum) && newNum !== number) {
                number = newNum;
                GM_log("[DEBUG] Nomor: " + number);

                fetch(`${ENDPOINT}/${lang}/${course}/${unit}/${number}`)
                    .then((response) => response.json())
                    .then((data) => {
                        GM_log("[DEBUG] Jawaban: " + data);
                        const options = document.querySelectorAll(".bl-content-center");
                        options.forEach((option) => {
                            if (data.includes(option.textContent)) {
                                option.style.border = "0.3rem solid rgb(255, 0, 255)";
                            }
                        });
                    });
            }
        });
    }

    // Create a MutationObserver to watch for changes in the DOM
    const observer = new MutationObserver(() => {
        extractInfo();
        fetchAndHighlightAnswers();
    });

    // Start observing changes to the entire document
    observer.observe(document.documentElement, {
        childList: true,
        subtree: true,
    });
})();
