# WillowTree Name Game

This is a simple implementation of the name game.
To run, use `http-server .`.
This implementation does not include a build step, and is only designed to run on current browsers (using es6).
However, the design is responsive and should function on modern mobile devices.

To see the game in action without downloading, visit [https://afriendlyrobot.github.io/willowtree_namegame/](https://afriendlyrobot.github.io/willowtree_namegame/)

---

This implementation provides a standard game, tracking correct and incorrect guesses.
After every correct guess, a new set of five names is chosen.
Scores accumulate until the page is refreshed or a new game mode is chosen.

Addtionally, this implementation provides Mat* and M* modes, restricting the set of people shown to those with first names beginning with Mat or M, respectively.
Scoring in these modes functions the same as the standard mode.

Finally, this implementation provides a timed mode.
Only correct answers are displayed during the timed mode, as the goal is to make a maximum number of matches in the given time.
Correct matches grant 2 seconds (increasing the remaining time), while incorrect guesses lose 2 seconds (reducing the remaining time).
This behavior is designed to encourage accuracy during timed mode, even though incorrect guesses are not displayed.
