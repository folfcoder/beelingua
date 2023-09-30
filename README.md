# Beelingua Helper

A userscript + API to show (highlight) answers to Beelingua exercises for BINUS students.

![image](https://github.com/folfcoder/beelingua/assets/40331046/88db5878-1db5-413b-9108-1d9a087670e1)


## Installation

1. **Install [Tampermonkey](https://www.tampermonkey.net/):** This script requires the Tampermonkey extension for your web browser.

2. **Install Beelingua Helper:**
   - Click the following link to access the script: [Beelingua Helper Userscript](https://github.com/folfcoder/beelingua/raw/main/beelingua.user.js)
   - Click the 'Install' button on the page to add the script to Tampermonkey.
  
3. If you have Beelingua open before installing the script, you need to refresh the page for the script to work.

## Usage

Once installed, Beelingua Helper automates the process of retrieving answers from our API and highlights correct answers in purple.

### API (For Developers)

To incorporate Beelingua Helper's API into your project, simply make use of the following public API endpoint: `https://beelingua.folfcoder.workers.dev/{LANG}/{COURSE}/{UNIT}/{NUMBER}`.
- LANG can be either JPN or ENG.
- COURSE options include A1.1, C1.1, and others.
- UNIT can be "UNIT X", "Checkpoint Y", or "Course Mastery" (pay attention to CAPS)
- NUMBER should be specified as 1, 2, 3, and so on.

For instance, if you need to access answer for JPN-A1.1, Unit 2, number 10, you can use the URL: `https://beelingua.folfcoder.workers.dev/JPN/A1.1/UNIT 2/10`.

## Notes

Please don't abuse this script. Use it wisely and only when you're stuck. Don't use it to cheat on your exercises. I'm not responsible for any consequences that may occur if you use this script to cheat.

## Limitations

- It could break at any time if Beelingua changes their website.
- The script currently works on exercises that have multiple choice answers.
- Dependent on the API. If the API is down, the script won't work.
- The database is not complete yet. If you find an exercise that doesn't have the answers, please open an issue.

## Contributing

Contributions are welcome! Please discuss any changes you want to make via issues before making a pull request.

## License

Public domain. Do whatever you want with it.
