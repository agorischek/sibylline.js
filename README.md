# Sibylline

_Adj. Written by those who can see the future._

Sibylline is a language-agnostic time-dependent content markup notation. It enables the advance declarative authoring of text that will render differently depending on the time of rendering. It can be used with HTML, Markdown, plaintext, etc., and it can be interpreted at built time, server render time, client render time, etc. The interpreter reference implementation is written in JavaScript.

```
It |||(2018)is|isn’t||| the year Twenty Eighteen.

\\2018 --> It is the year Twenty Eighteen.
\\Not 2018 --> It isn't year Twenty Eighteen.
```

Conditional content to be processed by Sibylline is wrapped in triple pipes (`|||`).
```
|||This content will be processed. |||This content won't be processed.

\\Always --> This content will be processed. This content won't be processed.
```

Conditions for rendering are indicated in parentheses following the opening triple pipe:
```
a|||(>2010)b|||c

\\2010 or before --> ac
\\After 2010 --> abc
```

Content options are separated by single pipes:
```
a|||(>2010)b|c|||d

\\2010 or before --> acd
\\After 2010 --> abd
```

Each option can have its own condition:
```
a|||(>2010)b|(<2000)c|d|||e

\\Before 2000 --> ace
\\2000 through 2010 --> ade
\\After 2010 --> abe
```

If none of the options with conditions match, the first option without a condition is used:
```
a|||(<=2018)b|c|d|e|||f

\\2018 --> abf
\\Not 2018 --> acf
```

## Render
The main function in Sibylline is `render`, which requires the raw content for processing as input:
```
sibylline.render("a|||(2018)b|||c")
```
It also accepts an optional timestamp, an optional variable object, and an optional custom holder string:
```
sibylline.render("a&&(2018)b&&c", "2019", {milestone:"2020"}, "&&")
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
