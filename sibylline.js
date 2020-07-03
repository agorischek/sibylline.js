const _ = require("underscore");
const moment = require("moment");

const sibylline = {
  render: function(input, timeInput, variablesInput, holderInput) {
    const triggerTime = moment().format();

    var time = {
      //Time value that was input to the function
      input: null,
      //Format of the input time value, such as YYYY
      inputFormat: null,
      //String version of the input, since it could be a number
      inputString: null,
      //Time that the function was triggered
      trigger: null,
      //Actual time to use for comparison purposes
      reference: null
    };

    //Patterns for determining Sibyilling date shorthand format
    const shorthandPattern = {
      YYYY: /^[0-9][0-9][0-9][0-9]$/,
      MM: /^[0-9][0-9]$/,
      YYYYMM: /^[0-9][0-9][0-9][0-9]-[0-9][0-9]$/,
      MMDD: /^[0-9][0-9]-[0-9][0-9]$/,
      YYYYMMDD: /^[0-9][0-9][0-9][0-9]-[0-9][0-9]-[0-9][0-9]$/
    };

    //Calculate and set various properties of the time object
    time.trigger = triggerTime;
    time.input = timeInput;
    time.inputString = toStringIfExists(time.input);
    time.inputFormat = determineTimeFormat(time.inputString);
    time.reference = selectReferenceTime();

    const parentheticalPattern = /^\((.*?)\)/;
    const operatorPattern = /^[\<\>\!\+\-]+?/;

    const operators = {
      during: null,
      notDuring: "!",
      after: ">",
      before: "<",
      duringOrAfter: "+",
      duringOrBefore: "-"
    };

    //Set the pattern used to recognize conditional content
    var holder = "";
    const holderDefault = "|||";
    setHolder();

    //Process the document
    var processedContent = processDocument(input);

    //Return the final, rendered document
    return processedContent;

    //Determine the format of a Sibylline timestamp shorthand. For example, 2018 will return YYYY.
    function determineTimeFormat(timeShorthand) {
      var format = null;
      if (timeShorthand) {
        if (timeShorthand.match(shorthandPattern.YYYY)) {
          format = "YYYY";
        } else if (timeShorthand.match(shorthandPattern.MM)) {
          format = "MM";
        } else if (timeShorthand.match(shorthandPattern.YYYYMM)) {
          format = "YYYY-MM";
        } else if (timeShorthand.match(shorthandPattern.MMDD)) {
          format = "MM-DD";
        } else if (timeShorthand.match(shorthandPattern.YYYYMMDD)) {
          format = "YYYY-MM-DD";
        }
      }
      return format;
    }

    //Determine the unit of a Sibylline timestamp shorthand. For example, 2018 will return YYYY.
    function determineTimeUnit(timeShorthand) {
      var unit = null;
      if (timeShorthand) {
        if (timeShorthand.match(shorthandPattern.YYYY)) {
          unit = "year";
        } else if (timeShorthand.match(shorthandPattern.MM)) {
          unit = "month";
        } else if (timeShorthand.match(shorthandPattern.YYYYMM)) {
          unit = "month";
        } else if (timeShorthand.match(shorthandPattern.MMDD)) {
          unit = "day";
        } else if (timeShorthand.match(shorthandPattern.YYYYMMDD)) {
          unit = "day";
        }
      }
      return unit;
    }

    //Either use the default holder value, or use the optional input
    function setHolder() {
      if (holderInput) {
        holder = holderInput;
      } else {
        holder = holderDefault;
      }
    }

    //If an artificial time is input, use that; else, use the actual time
    function selectReferenceTime() {
      if (time.input) {
        return time.inputString;
      } else {
        return time.trigger;
      }
    }

    //Processes the document step by step
    function processDocument(input) {
      var document = [];
      var output = "";

      //Creates the document object from simple array
      document = createDocumentObject(input);

      //Sets the conditional property on each document object
      document = setConditional(document);

      //Parses the options for each conditional document element
      document = parseContentOptions(document);

      //Parses the actual conditions for each option of each conditional document element
      document = parseConditions(document);

      //Chooses from all available options to generate the final rendered content
      output = buildOutput(document);

      return output;
    }

    //Turns the raw input into an object of individual elements, for further processing
    function createDocumentObject(rawInput) {
      var documentObject = [];
      var documentArray = rawInput.split(holder);
      each(documentArray, function(item, index, list) {
        documentObject.push({
          content: item
        });
      });
      return documentObject;
    }

    //Add the conditional bool property to each document element based on its index
    function setConditional(documentObject) {
      each(documentObject, function(documentElement, index) {
        var conditional = true;
        if (isEven(index)) {
          conditional = false;
        }
        documentElement.conditional = conditional;
      });
      return documentObject;
    }

    function parseContentOptions(documentObject) {
      each(documentObject, function(documentElement, index) {
        if (documentElement.conditional) {
          var contentOptions = documentElement.content.split("|");
          documentElement.options = [];
          each(contentOptions, function(contentOption, index) {
            documentElement.options.push({
              content: contentOption
            });
          });
        }
      });
      return documentObject;
    }

    function extractCondition(content) {
      return content.match(parentheticalPattern)[1];
    }

    function extractText(content) {
      return content.replace(parentheticalPattern, "");
    }

    function conditionHasOperator(condition) {
      return condition.match(operatorPattern);
    }

    function extractOperator(condition) {
      //If the condition contains an operator, such as "<2018"
      if (conditionHasOperator(condition)) {
        return condition.match(operatorPattern)[0];
      }
      //If the condition doesn't contain an operator, such as "2018"
      else {
        return null;
      }
    }

    function extractReference(condition) {
      return condition.replace(operatorPattern, "");
    }

    function hasParenthetical(content) {
      return content.match(parentheticalPattern);
    }

    //Pass in the document object and
    function parseConditions(documentObject) {
      each(documentObject, function(documentElement, index) {
        //Only try to parse options if that document element has conditional content
        if (documentElement.conditional) {
          each(documentElement.options, function(contentOption, index) {
            var content = contentOption.content;

            //If the content option has a condition parenthetical, parse that
            if (hasParenthetical(content)) {
              var condition,
                text,
                operator,
                reference = "";

              //Gets the condition out of parentheses, such as "<=2018"
              condition = extractCondition(content);
              contentOption.condition = condition;

              //Gets portion of content not in parentheses, such as "abc"
              text = extractText(content);
              contentOption.text = text;

              //Gets the operator out of the condition, such as "<="
              operator = extractOperator(condition);
              contentOption.operator = operator;

              //Gets the reference out of the condition, such as "2018"
              reference = extractReference(condition);
              contentOption.reference = reference;
            }

            //If the content option doesn't have a condition parenthetical, just set the text
            else {
              contentOption.condition = null;
              contentOption.operator = null;
              contentOption.reference = null;
              contentOption.text = content;
            }
          });
        }
      });
      return documentObject;
    }

    function largerTimeUnit(timeA, timeB) {
      var timeAUnit = determineTimeUnit(timeA);
      var timeBUnit = determineTimeUnit(timeB);
      var largerUnit = "";
      const units = ["year", "month", "day"];
      each(units, function(unit) {
        if (largerUnit == "") {
          if (timeAUnit == unit || timeBUnit == unit) {
            largerUnit = unit;
          }
        }
      });
      return largerUnit;
    }

    //Is Time A during Time B?
    function during(timeA, timeB) {
      result = false;
      unit = largerTimeUnit(timeA, timeB);
      timeAFormatted = moment(timeA, determineTimeFormat(timeA));
      timeBFormatted = moment(timeB, determineTimeFormat(timeB));
      result = moment(timeAFormatted).isSame(timeBFormatted, unit);
      return result;
    }

    // Is Time A not during Time B?
    function notDuring(timeA, timeB) {
      result = false;
      unit = largerTimeUnit(timeA, timeB);
      result = !moment(timeA).isSame(timeB, unit);
      return result;
    }

    function qualifyTime(time) {
      var qualifiedTime = time;
      if (determineTimeFormat(time) == "MM") {
        qualifiedTime = moment().year() + "-" + time;
      } else if (determineTimeFormat(time) == "MM-DD") {
        qualifiedTime = moment().year() + "-" + time;
      }
      return qualifiedTime;
    }

    // Is Time A before Time B?
    function before(timeA, timeB) {
      result = false;
      unit = largerTimeUnit(timeA, timeB);
      result = moment(timeA).isBefore(timeB, unit);
      return result;
    }

    // Is Time A after Time B?
    function after(timeA, timeB) {
      result = false;
      unit = largerTimeUnit(timeA, timeB);
      result = moment(timeA).isAfter(timeB, unit);
      return result;
    }

    // Is Time A during or before Time B?
    function duringOrBefore(timeA, timeB) {
      result = false;
      unit = largerTimeUnit(timeA, timeB);
      result = moment(timeA).isSameOrBefore(timeB, unit);
      return result;
    }

    // Is Time A during or after Time B?
    function duringOrAfter(timeA, timeB) {
      result = false;
      unit = largerTimeUnit(timeA, timeB);
      result = moment(timeA).isSameOrAfter(timeB, unit);
      return result;
    }

    //Pass in a document element and choose the right piece of content from the available options
    function chooseOption(documentElement) {
      var text = "";

      each(documentElement.options, function(option, index, options) {
        //Stop iterating once we've found a value for text.
        if (text == "") {
          var operator = option.operator;
          var timeReference = qualifyTime(time.reference);
          var optionReference = qualifyTime(option.reference);

          if (operator == operators.notDuring) {
            if (notDuring(timeReference, optionReference)) {
              text = option.text;
            }
          } else if (operator == operators.before) {
            if (before(timeReference, optionReference)) {
              text = option.text;
            }
          } else if (operator == operators.after) {
            if (after(timeReference, optionReference)) {
              text = option.text;
            }
          } else if (operator == operators.duringOrBefore) {
            if (duringOrBefore(timeReference, optionReference)) {
              text = option.text;
            }
          } else if (operator == operators.duringOrAfter) {
            if (duringOrAfter(timeReference, optionReference)) {
              text = option.text;
            }
          } else if (operator == operators.during) {
            if (during(timeReference, optionReference)) {
              text = option.text;
            }

            //In the case where the first (and possibly only) content option has no condition,
            //both the operator and the reference will be null
            else if (optionReference == null) {
              text = option.text;
            }

            //If none of the previous comparisons matched, and if there's a fallback, use the fallback
            else if (options[index + 1]) {
              text = options[index + 1].text;
            }
          }
        }
      });
      return text;
    }

    //Pass in the document object and generate the final output
    function buildOutput(documentObject) {
      var output = "";
      each(documentObject, function(documentElement, index) {
        //If the item is conditional text, process it
        if (documentElement.conditional) {
          //Choose from the set of available options
          var text = chooseOption(documentElement);

          output = output.concat(text);
        }

        //If the item isn't conditional text, use it as is
        else {
          output = output.concat(documentElement.content);
        }
      });
      return output;
    }

    function log(message) {
      console.log(message);
    }

    function each(list, action) {
      _.each(list, action);
    }

    function isEven(num) {
      if (num % 2 === 0) {
        return true;
      } else {
        return false;
      }
    }

    //Convert to string, accounting for possible null value
    function toStringIfExists(time) {
      var string = "";
      if (time) {
        string = time.toString();
      } else {
        string = null;
      }
      return string;
    }
  }
};

// Define export if running in a Node environment; do nothing if in the browser
if (typeof module !== "undefined" && typeof module.exports !== "undefined") {
  module.exports = sibylline;
}
