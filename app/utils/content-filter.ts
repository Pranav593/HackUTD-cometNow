// This file contains content filtering utilities
// Note: This is a basic implementation. For production, consider using established content filtering services.

const inappropriateWords = [
    // Profanity
    'ass\\w*', 'f[u\\*]ck\\w*', 'sh[i\\*]t\\w*', 'b[i\\*]tch\\w*', 'damn', 'hell',
    'cunt\\w*', 'dick\\w*', 'piss\\w*', 'cock\\w*', 'twat\\w*', 'tits?\\w*',
    'whore\\w*', 'slut\\w*', 'bastard\\w*', 'douche\\w*', 'crap\\w*',
    
    // Hate Speech & Discrimination
    'nazi\\w*', 'racist\\w*', 'white\\s*power', 'black\\s*power',
    'nigge?r\\w*', 'fag\\w*', 'homo\\w*', 'dyke\\w*', 'queer\\w*',
    'chink\\w*', 'spic\\w*', 'wetback\\w*', 'beaner\\w*', 'kike\\w*',
    'towelhead\\w*', 'raghead\\w*', 'sand\\s*nigge?r\\w*', 'gook\\w*',
    'gringo\\w*', 'redskin\\w*', 'white\\s*trash\\w*', 'zipperhead\\w*',
    'retard\\w*', 'tard\\w*', 'spastic\\w*', 'handicap\\w*', 'cripple\\w*',
    
    // Sexual Content & Harassment
    'sex\\w*', 'porn\\w*', 'nsfw', 'xxx', 'adult',
    'rape\\w*', 'molest\\w*', 'incest\\w*', 'pedo\\w*', 'loli\\w*',
    'gangbang\\w*', 'orgy\\w*', 'bukkake\\w*', 'cumm?\\w*', 'jizz\\w*',
    'anal\\w*', 'dildo\\w*', 'vibrator\\w*', 'fleshlight\\w*',
    'masturba\\w*', 'orgasm\\w*', 'foreplay\\w*', 'fellatio\\w*',
    'cunnilingus\\w*', 'rimjob\\w*', 'blowjob\\w*', 'handjob\\w*',
    
    // Violence & Gore
    'kill\\w*', 'murder\\w*', 'dead\\w*', 'death\\w*', 'suicide\\w*',
    'gore\\w*', 'brutal\\w*', 'torture\\w*', 'massacre\\w*', 'slaughter\\w*',
    'terrorist\\w*', 'bomb\\w*', 'explosion\\w*', 'shooter\\w*', 'shooting\\w*',
    'stab\\w*', 'knife\\w*', 'blood\\w*', 'wound\\w*', 'injury\\w*',
    'mutilat\\w*', 'decapitat\\w*', 'dismember\\w*', 'corpse\\w*',
    
    // Substance Abuse
    'drug\\w*', 'cocaine', 'heroin', 'weed', 'marijuana',
    'meth\\w*', 'crack\\w*', 'crystal\\s*meth', 'ecstasy', 'mdma',
    'lsd', 'acid\\w*', 'shroom\\w*', 'cannabis\\w*', 'hash\\w*',
    'needle\\w*', 'syringe\\w*', 'overdose\\w*', 'junkie\\w*',
    'alcoholic\\w*', 'drunk\\w*', 'wasted\\w*', 'high\\w*',
    
    // Spam & Scams
    'spam\\w*', 'scam\\w*', 'hack\\w*', 'crack\\w*', 'pirate\\w*',
    'phish\\w*', 'fraud\\w*', 'steal\\w*', 'theft\\w*', 'rob\\w*',
    'virus\\w*', 'malware\\w*', 'trojan\\w*', 'keylogger\\w*',
    'torrent\\w*', 'warez\\w*', 'keygen\\w*', 'cracked\\w*',
    
    // General Inappropriate
    'nude\\w*', 'naked\\w*', 'explicit\\w*',
    'prostitut\\w*', 'escort\\w*', 'stripper\\w*', 'hooker\\w*',
    'gambling\\w*', 'betting\\w*', 'casino\\w*', 'poker\\w*',
    'ponzi\\w*', 'pyramid\\s*scheme\\w*', 'mlm\\w*',
    'nipple\\w*', 'boob\\w*', 'breast\\w*', 'vagina\\w*', 'penis\\w*',
    
    // Cyberbullying
    'loser\\w*', 'idiot\\w*', 'stupid\\w*', 'dumb\\w*', 'moron\\w*',
    'ugly\\w*', 'fat\\w*', 'pathetic\\w*', 'worthless\\w*',
    'kys\\w*', 'kms\\w*', 'neck\\s*yourself\\w*', 'end\\s*yourself\\w*',
    
    // Extremism
    'jihad\\w*', 'extremist\\w*', 'radical\\w*', 'fanatic\\w*',
    'supremac\\w*', 'fascist\\w*', 'communist\\w*', 'marxist\\w*'
];

// Add more categories as needed...

// Create a single regex pattern that matches any inappropriate word
const inappropriatePattern = new RegExp(
    `\\b(${inappropriateWords.join('|')})\\b`,
    'i'
);

export function containsInappropriateContent(text: string): { isInappropriate: boolean; matches: string[] } {
    const matches = text.match(inappropriatePattern) || [];
    return {
        isInappropriate: matches.length > 0,
        matches: matches
    };
}