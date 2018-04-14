const assert = require("assert");
const sibylline = require("../src/sibylline.js")

describe("Interpreter", function(){

  it("should pass through plain text", function(){
      assert.equal(
          sibylline.render("Plain text with no Sibylline notation", 2019),
          "Plain text with no Sibylline notation"
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

  it("should recognize the less than operator", function(){
      assert.equal(
          sibylline.render("a|||(<2018)b|c|||d", 2017),
          "abd"
      )
  })

  it("should recognize the greater than operator", function(){
      assert.equal(
          sibylline.render("a|||(>2018)b|c|||d", 2019),
          "abd"
      )
  })

  it("should recognize the less than or equal operator", function(){
      assert.equal(
          sibylline.render("a|||(<=2018)b|c|||d", 2016),
          "abd"
      )
  })

  it("should recognize the greater than or equal operator", function(){
      assert.equal(
          sibylline.render("a|||(>=2018)b|c|||d", 2020),
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
          sibylline.render("a&&&&(>=2018)b|c&&&&d", 2020, null, "&&&&"),
          "abd"
      )
  })

})
