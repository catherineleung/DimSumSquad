selenium = require 'selenium-webdriver'
chai = require 'chai'
chai.use require 'chai-as-promised'
expect = chai.expect
loginInfo = Date.now().toString()

before ->
  @timeout 10000
  @driver = new selenium.Builder()
    .withCapabilities(selenium.Capabilities.chrome())
    .build()
  @driver.getWindowHandle()

after ->
  # @driver.quit()

describe 'DimSumSquad Automated Tests', ->
  beforeEach ->
    @timeout 10000 #default was 2000ms, too short
    @driver.get 'localhost:8080'

  it 'has \'SumComics\' as the window\'s title', ->
    expect(@driver.getTitle()).to.eventually.contain 'SumComics'

  it 'log in and out of default account', ->
    @driver.findElement(linkText: 'LOG IN').click()
    @driver.manage().timeouts().implicitlyWait(10000)
    @driver.findElement(id: 'inputEmail').sendKeys('asdf')
    @driver.findElement(id: 'inputPassword').sendKeys('asdf')
    @driver.findElement(id: 'loginButton').click()
    @driver.manage().timeouts().implicitlyWait(10000)
    @driver.findElement(linkText: 'Log Out').click()
    @driver.manage().timeouts().implicitlyWait(10000)

  it 'sign up for a new account', ->
    @driver.findElement(linkText: 'SIGN UP').click()
    @driver.manage().timeouts().implicitlyWait(10000)
    @driver.findElement(id: 'inputEmail').sendKeys(loginInfo)
    @driver.findElement(id: 'inputPassword').sendKeys(loginInfo)
    @driver.findElement(id: 'inputPasswordConfirm').sendKeys(loginInfo)
    @driver.findElement(id: 'inputUsername').sendKeys(loginInfo)
    @driver.findElement(id: 'contributor').click()
    @driver.findElement(id: 'terms').click()
    @driver.findElement(id: 'submit').click()
    @driver.manage().timeouts().implicitlyWait(10000)

  it 'log in and out of newly created account', ->
    @driver.findElement(linkText: 'LOG IN').click()
    @driver.manage().timeouts().implicitlyWait(10000)
    @driver.findElement(id: 'inputEmail').sendKeys(loginInfo)
    @driver.findElement(id: 'inputPassword').sendKeys(loginInfo)
    @driver.findElement(id: 'loginButton').click()
    @driver.manage().timeouts().implicitlyWait(10000)
    @driver.findElement(linkText: 'Log Out').click()
    @driver.manage().timeouts().implicitlyWait(10000)

  it 'delete newly created account', ->
    @driver.findElement(linkText: 'VIEW USERS').click()
    @driver.manage().timeouts().implicitlyWait(100000)
    @driver.findElement(id: loginInfo).click()

  # it 'has publication date', ->
  #   text = @driver.findElement(css: '.post .meta time').getText()
  #   expect(text).to.eventually.equal 'December 30th, 2014'

  # it 'links back to the homepage', ->
  #   @driver.findElement(linkText: 'Bites').click()
  #   expect(@driver.getCurrentUrl()).to.eventually.equal 'http://bites.goodeggs.com/'