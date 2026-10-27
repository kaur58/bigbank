# BigBank Homework

## What did i do

There was no info about the game mechanics or API description. So i create NodeJS console command that play the game and based on the info i got from that i made some decisions
- always try to do the easier quest first
- healing potion adds lives so a added logic that if lives go below some number then game should buy it
- did not discover if other items do anything but i let the game buy them anyway. Maybe it would be better to spend all the gold on healing instead
- there are quest the have i certain words in it. "super awesome diamond" this seems to be always a trap. added logic to make those quest 0% success rate
- some quest are encrypted. Encrypted == 1 looked like base64 string so that was easy. Since encrypted was not boolean value i looked for other values and discover there was also 2. That was a little harder but after some googling and trial and error discovered it was ROT13

## Repo structure

### Autoplayer

This is the first app i create for this tasks. It is console command written in Nodejs that autoplays the game until lives run out, we reach turn 1000 or user hits ctrl + c
App has its own readme file https://github.com/kaur58/bigbank/blob/main/autoplayer/README.md

### Webapp

I also created webapp for user to play the game in the browser and added basic autolay feature as well

#### Backend

Backend is simple NodeJs REST API using express that is a proxy between front and external API
Backend also calculates quest success probabilities before it return them to fronend. Autoplay uses that to pick the quests

App has its own readme file https://github.com/kaur58/bigbank/blob/main/webapp/backend/README.md

#### Fronend

Frontend is Vue3 app that uses Pinia for state management and TailwindCSS for styling
It has a landing page to start the game and game play page.

App has its own readme file https://github.com/kaur58/bigbank/blob/main/webapp/frontend/README.md
