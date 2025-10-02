import httpRequest from "./httpRequest.js";

const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);

const NEXT = 1;
const PREV = -1;
let currentSong;
