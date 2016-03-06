selenium = require 'selenium-webdriver'
chai = require 'chai'
chai.use require 'chai-as-promised'
expect = chai.expect

before ->
  @timeout 10000
  @driver = new selenium.Builder()
    .withCapabilities(selenium.Capabilities.chrome())
    .build()
  @driver.getWindowHandle()

after ->
  

describe 'DimSumSquad Automated Tests', ->
  beforeEach ->
    @timeout 10000 #default was 2000ms, too short
    @driver.get 'https://young-harbor-75843.herokuapp.com/'

  it 'has \'SumComics\' as the window\'s title', ->
    expect(@driver.getTitle()).to.eventually.contain 'SumComics'

  it 'links to the login page', ->
    @driver.findElement(linkText: 'LOG IN').click()
    @driver.manage().timeouts().implicitlyWait(10000)
    @driver.findElement(id: 'inputEmail').sendKeys('asdf')
    @driver.findElement(id: 'inputPassword').sendKeys('asdf')
    @driver.findElement(linkText: 'LOGIN').click()

  # it 'has publication date', ->
  #   text = @driver.findElement(css: '.post .meta time').getText()
  #   expect(text).to.eventually.equal 'December 30th, 2014'

  # it 'links back to the homepage', ->
  #   @driver.findElement(linkText: 'Bites').click()
  #   expect(@driver.getCurrentUrl()).to.eventually.equal 'http://bites.goodeggs.com/'