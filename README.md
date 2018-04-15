# Sibylline

_Adj. Written by those who can see the future._

Sibylline is a language-agnostic time-dependent content markup notation. It enables the advance declarative authoring of text that will render differently depending on the time of rendering. It can be used with HTML, Markdown, plaintext, etc., and it can be interpreted at built time, server render time, client render time, etc. The interpreter reference implementation is written in JavaScript.

```
It |||(2018)is|isn’t||| the year Twenty Eighteen.

\\During 2018 --> It is the year Twenty Eighteen.
\\Not during 2018 --> It isn't year Twenty Eighteen.
```

Conditional content to be processed by the Sibylline interpreter is wrapped in triple pipes (`|||`).
```
|||This content will be processed. |||This content won't be processed.

\\Always --> This content will be processed. This content won't be processed.
```

Conditions for rendering are indicated in parentheses following the opening triple pipe:
```
a|||(2018)b|||c

\\During 2018 --> abc
\\Not during 2018 --> ac
```

Content options are separated by single pipes:

```
a|||(2018)b|(2019)c|||d

\\During 2018 --> abd
\\During 2019 --> acd
\\Not during 2018 or 2019 --> ad
```

If none of the options with conditions match, the first option without a condition is used:
```
a|||(2018)b|c|d|||e

\\During 2018 --> abe
\\Not during 2018 --> ace
```

## Render
The main function in the Sibylline interpreter is `render`, which requires the raw content for processing as input:
```
sibylline.render("a|||(2018)b|||c")
```
It also accepts an optional explicit timestamp:
```
sibylline.render("a|||(2018)b|||c", "2019")
```

## Operators
Sibylline supports six operators:
### During
During is indicated by a lack of explicit operator character:
```
|||(2018)abc|||
```
### Not during
Not during is indicated by `!`:
```
|||(!2018)abc|||
```
### After
After than is indicated by `>`:
```
|||(>2018)abc|||
```
### During or after
During or after is indicated by `+`:
```
|||(+2018)abc|||
```
### Before
Before is indicated by `<`:
```
|||(<2018)abc|||
```
### During or before
During or before is indicated by `-`:
```
|||(-2018)abc|||
```

## Time notation
Sibylline provides five custom time shorthand patterns, which are disambituguated based on their structure. All other patterns are parsed by the [underlying date engine](http://momentjs.com/docs/#/parsing/string/).
### Year only
Follows `YYYY` format:
```
|||(2018)abc|||
```
### Year and month
Follows `YYYY-MM` format:
```
|||(2018-12)abc|||
```
### Year, month, and day
Follows `YYYY-MM-DD` format:
```
|||(2018-12-31)abc|||
```
### Month only
Follows `MM` format:
```
|||(12)abc|||
```
At evaluation time, will be qualified with the current year.
### Month and day
Follows `MM-DD` format:
```
|||(12-31)abc|||
```
At evaluation time, will be qualified with the current year.
