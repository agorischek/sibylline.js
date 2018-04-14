const _ = require("underscore")

const sibylline = {
    render: function(input, timeInput, variablesInput, holderInput){

        const parentheticalPattern = /^\((.*?)\)/
        const operatorPattern = /^[\<\>\!\+\-]+?/

        const operators = {
            during: null,
            notDuring: "!",
            after: ">",
            before: "<",
            duringOrAfter: "+",
            duringOrBefore: "-"
        }

        var time
        setTime();

        var holder = ""
        const holderDefault = "|||"
        setHolder();

        var processedContent = processDocument(input)
        return processedContent

        function setHolder(){
            if(holderInput){
                holder = holderInput
            }
            else{
                holder = holderDefault
            }
        }

        function setTime(){
            if(timeInput){
                time = timeInput
            }
            else{
                time = getTime();
            }
        }

        function processDocument(input){

            var document = []
            var output = ""

            //Creates the document object from simple array
            document = createDocumentObject(input)

            //Sets the conditional property on each document object
            document = setConditional(document)

            //Parses the options for each conditional document element
            document = parseContentOptions(document)

            //Parses the actual conditions for each option of each conditional document element
            document = parseConditions(document)

            //Chooses from all available options to generate the final rendered content
            output = buildOutput(document)

            return output
        }

        function getTime(){
            return "2018"
        }

        function createDocumentObject(rawInput){
            var documentObject = []
            var documentArray = rawInput.split(holder)
            each(documentArray, function(item, index, list){
                documentObject.push({
                    content: item
                })
            })
            return documentObject
        }

        //Add the conditional bool property to each document element based on its index
        function setConditional(documentObject){
            each(documentObject, function(documentElement, index){
                var conditional = true
                if(isEven(index)){
                    conditional = false
                }
                documentElement.conditional = conditional
            })
            return documentObject
        }

        function parseContentOptions(documentObject){
            each(documentObject, function(documentElement, index){
                if(documentElement.conditional){
                    var contentOptions = documentElement.content.split("|")
                    documentElement.options = []
                    each(contentOptions, function(contentOption, index){
                        documentElement.options.push({
                            content: contentOption
                        })
                    })
                }
            })
            return documentObject
        }

        function extractCondition(content){
            return content.match(parentheticalPattern)[1]
        }

        function extractText(content){
            return content.replace(parentheticalPattern, "")
        }

        function conditionHasOperator(condition){
            return condition.match(operatorPattern)
        }

        function extractOperator(condition){
            //If the condition contains an operator, such as "<2018"
            if(conditionHasOperator(condition)){
                return condition.match(operatorPattern)[0]
            }
            //If the condition doesn't contain an operator, such as "2018"
            else{
                return null
            }
        }

        function extractReference(condition){
            return condition.replace(operatorPattern, "")
        }

        function hasParenthetical(content){
            return content.match(parentheticalPattern)
        }

        //Pass in the document object and
        function parseConditions(documentObject){
            each(documentObject, function(documentElement, index){

                //Only try to parse options if that document element has conditional content
                if(documentElement.conditional){
                    each(documentElement.options, function(contentOption, index){
                        var content = contentOption.content

                        //If the content option has a condition parenthetical, parse that
                        if(hasParenthetical(content)){

                            var condition, text, operator, reference = ""

                            //Gets the condition out of parentheses, such as "<=2018"
                            condition = extractCondition(content)
                            contentOption.condition = condition

                            //Gets portion of content not in parentheses, such as "abc"
                            text = extractText(content)
                            contentOption.text = text

                            //Gets the operator out of the condition, such as "<="
                            operator = extractOperator(condition)
                            contentOption.operator = operator

                            //Gets the reference out of the condition, such as "2018"
                            reference = extractReference(condition)
                            contentOption.reference = reference
                        }

                        //If the content option doesn't have a condition parenthetical, just set the text
                        else {
                            contentOption.condition = null
                            contentOption.operator = null
                            contentOption.reference = null
                            contentOption.text = content
                        }
                    })
                }
            })
            return documentObject
        }

        //Pass in a document element and choose the right piece of content from the available options
        function chooseOption(documentElement){

            var text = ""

            each(documentElement.options, function(option, index, options){

                //Stop iterating once we've found a value for text.
                if(text == ""){
                    var operator = option.operator
                    var reference = option.reference

                    if(operator == operators.notDuring){
                        if(time != reference){
                            text = option.text
                        }
                    }
                    else if(operator == operators.before){
                        if(time < reference){
                            text = option.text
                        }
                    }
                    else if(operator == operators.after){
                        if(time > reference){
                            text = option.text
                        }
                    }
                    else if(operator == operators.duringOrBefore){
                        if(time <= reference){
                            text = option.text
                        }
                    }
                    else if(operator == operators.duringOrAfter){
                        if(time >= reference){
                            text = option.text
                        }
                    }
                    else if(operator == operators.during){
                        if(time == reference){
                            text = option.text
                        }

                        //In the case where the first (and possibly only) content option has no condition,
                        //both the operator and the reference will be null
                        else if(reference == null){
                            text = option.text
                        }

                        //If none of the previous comparisons matched, and if there's a fallback, use the fallback
                        else if(options[index + 1]){
                            text = options[index + 1].text
                        }

                    }
                }
            })
            return text
        }

        //Pass in the document object and generate the final output
        function buildOutput(documentObject){
            var output = ""
            each(documentObject, function(documentElement, index){

                //If the item is conditional text, process it
                if(documentElement.conditional){

                    //Choose from the set of available options
                    var text = chooseOption(documentElement)

                    output = output.concat(text)
                }

                //If the item isn't conditional text, use it as is
                else{
                    output = output.concat(documentElement.content)
                }

            })
            return output
        }

        function log(message){
            console.log(message)
        }

        function each(list, action){
          _.each(list, action)
        }

        function isEven(num){
            if(num % 2 === 0){
                return true
            }
            else{
                return false
            }
        }

    }
}

module.exports = sibylline;
