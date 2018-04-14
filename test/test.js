const assert = require("assert");
const sibylline = require("../src/sibylline.js")

describe("Interpreter", function(){

  it("should pass through plain text", function(){
      assert.equal(
          sibylline.render("Plain text with no Sibylline notation", 2019),
          "Plain text with no Sibylline notation"
      )
  })

  it("should include content with no conditions and a single option", function(){
      assert.equal(
          sibylline.render("a|||b|||c", 2018),
          "abc"
      )
  })

  it("should include content with simple time match, with no fallback", function(){
      assert.equal(
          sibylline.render("a|||(2018)b|||c", 2018),
          "abc"
      )
  })

  it("should include else content with simple time mismatch, with no fallback", function(){
      assert.equal(
          sibylline.render("a|||(2018)b|||c", 2019),
          "ac"
      )
  })

  it("should include content with simple time match, and exclude the fallback", function(){
      assert.equal(
          sibylline.render("a|||(2018)b|c|||d", 2018),
          "abd"
      )
  })

  it("should exclude content with simple time mismatch, and include the fallback", function(){
      assert.equal(
          sibylline.render("a|||(2018)b|c|||d", 2019),
          "acd"
      )
  })

  it("should recognize the not during operator", function(){
      assert.equal(
          sibylline.render("a|||(!2000)b|c|||d", 2017),
          "abd"
      )
  })

  it("should recognize the before operator", function(){
      assert.equal(
          sibylline.render("a|||(<2018)b|c|||d", 2017),
          "abd"
      )
  })

  it("should recognize the after operator", function(){
      assert.equal(
          sibylline.render("a|||(>2018)b|c|||d", 2019),
          "abd"
      )
  })

  it("should recognize the during or before operator", function(){
      assert.equal(
          sibylline.render("a|||(-2018)b|c|||d", 2016),
          "abd"
      )
  })

  it("should recognize the during or after operator", function(){
      assert.equal(
          sibylline.render("a|||(+2018)b|c|||d", 2020),
          "abd"
      )
  })

  it("should work without submitting a time", function(){
      assert.equal(
          sibylline.render("a|||(>2000)b|c|||d"),
          "abd"
      )
  })

  it("should accept a custom holder", function(){
      assert.equal(
          sibylline.render("a&&&&(+2018)b|c&&&&d", 2020, null, "&&&&"),
          "abd"
      )
  })

  it("should process a document with a lot of elements", function(){
      assert.equal(
          sibylline.render("a|||(2018)b|(>2018)c|d|||ef|||(-2020)g|h|||ijk|||(<2030)l|(>2040)|m|||", 2018),
          "abefgijkl"
      )
  })

  it("should process a realistic document", function(){
      assert.equal(
          sibylline.render("We |||(<2020)will begin construction in|began construction in||| 2020.", 2018),
          "We will begin construction in 2020."
      )
  })

  // it("should ignore holders that are escaped", function(){
  //     assert.equal(
  //         sibylline.render("a|||bc(<2020)will begin construction in|began construction in||| 2020.", 2018),
  //         "We will begin construction in 2020."
  //     )
  // })

})
