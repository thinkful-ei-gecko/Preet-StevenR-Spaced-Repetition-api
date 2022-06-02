const express = require('express')
const jsonParser = express.json()
const LanguageService = require('./language-service')
const { _Node, toArray,  } = require('../linked-list');
const { requireAuth } = require('../middleware/jwt-auth')

const languageRouter = express.Router()

languageRouter
  .use(requireAuth)
  .use(async (req, res, next) => {
    try {
      const language = await LanguageService.getUsersLanguage(
        req.app.get('db'),
        req.user.id,
      )

      if (!language)
        return res.status(404).json({
          error: `You don't have any languages`,
        })

      req.language = language
      next()
    } catch (error) {
      next(error)
    }
  })

languageRouter
  .get('/', async (req, res, next) => {
    try {
      const words = await LanguageService.getLanguageWords(
        req.app.get('db'),
        req.language.id,
      )

      res.json({
        language: req.language,
        words,
      })
      next()
    } catch (error) {
      next(error)
    }
  })

languageRouter
  .get('/head', async (req, res, next) => {
    try{
      const [nextWord] = await LanguageService.getNextWord(
        req.app.get('db'),
        req.language.id
      )
      res.json({
        nextWord: nextWord.original,
        totalScore: req.language.total_score,
        wordCorrectCount: nextWord.correct_count,
        wordIncorrectCount: nextWord.incorrect_count,
      })
      next()
    }
    catch(error) {
      next(error)
    }
  })

languageRouter//persist changes to db
  .post('/guess', jsonParser, async (req, res, next) => {
    //implement 
    const guess = req.body.guess;
    if(!guess){
      res.status(400).json({
        error: `Missing 'guess' in request body`,
      })
    }
    try {
      const words = await LanguageService.getLanguageWords(
      //get users words from db
        req.app.get('db'),
        req.language.id,
      )
      const [{head}] = await LanguageService.getLanguageHead(
      //sets the head/start of the users list
        req.app.get('db'),
        req.language.id,
      )
      const list = LanguageService.createLinkedList(words, head)      
      const [checkNextWord] = await LanguageService.checkGuess(
      //create ll of words and wait for users guess - then move into conditonals
        req.app.get('db'),
        req.language.id
      )
      //if correct guess, update memory val of curr word 
      if(checkNextWord.translation === guess){
        const newMemVal = list.head.value.memory_value * 2;
        list.head.value.memory_value = newMemVal;
        list.head.value.correct_count++;
      //move curr word back in the list 
        let curr = list.head
        let countDown = newMemVal
        while(countDown > 0 && curr.next !== null){
          curr = curr.next
          countDown--;
        }
        const temp = new _Node(list.head.value)//node val changes each time  

        if(curr.next === null){
          temp.next = curr.next
          curr.next = temp
          list.head = list.head.next
          curr.value.next = temp.value.id
          temp.value.next = null
        } else {
          temp.next = curr.next
          curr.next = temp
          list.head = list.head.next
          curr.value.next = temp.value.id
          temp.value.next = temp.next.value.id
        }
        req.language.total_score++
        await LanguageService.updateWordsTable(
          req.app.get('db'),
          toArray(list),
          req.language.id,
          req.language.total_score
        )
        res.json({
          nextWord: list.head.value.original,
          totalScore: req.language.total_score,
          wordCorrectCount: list.head.value.correct_count,
          wordIncorrectCount: list.head.value.incorrect_count,
          answer: temp.value.translation,
          isCorrect: true
        })
      } 
      
      else {
        // else: users answer is correct, set mem val to curr word = 1
        list.head.value.memory_value = 1;
        list.head.value.incorrect_count++;

        let curr = list.head
        //console.log(curr);
        //move curr word back 
        let countDown = 1
        while(countDown > 0){
          curr = curr.next
          countDown--;
        }
        //update node val of new head
        const temp = new _Node(list.head.value)
        temp.next = curr.next
        curr.next = temp
        list.head = list.head.next
        curr.value.next = temp.value.id
        temp.value.next = temp.next.value.id
        
        //update the words and persist the new updates to the db
        await LanguageService.updateWordsTable(
          req.app.get('db'),
          toArray(list),
          req.language.id,
          req.language.total_score
        )
        res.json({
          nextWord: list.head.value.original,
          totalScore: req.language.total_score,
          wordCorrectCount: list.head.value.correct_count,
          wordIncorrectCount: list.head.value.incorrect_count,
          answer: temp.value.translation,
          isCorrect: false
        });
      }
      next()
    }
    catch(error){
      next(error)
    }
  })

module.exports = languageRouter
