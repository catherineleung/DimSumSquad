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
  @driver.quit()

describe 'DimSumSquad Automated Tests', ->
  beforeEach ->
    @timeout 10000 #default was 2000ms, too short
    @driver.get 'http://sumcomics.herokuapp.com'

  it 'has \'SumComics\' as the window\'s title', ->
    expect(@driver.getTitle()).to.eventually.contain 'SumComics'

  it 'sign up with passwords that do not match', ->
    @driver.findElement(linkText: 'SIGN UP').click()
    @driver.manage().timeouts().implicitlyWait(10000)
    @driver.findElement(id: 'inputEmail').sendKeys(loginInfo)
    @driver.findElement(id: 'inputPassword').sendKeys('abc')
    @driver.findElement(id: 'inputPasswordConfirm').sendKeys('abcd')
    @driver.findElement(id: 'inputUsername').sendKeys(loginInfo)
    @driver.findElement(id: 'contributor').click()
    @driver.findElement(id: 'terms').click()
    @driver.findElement(id: 'submit').click()
    @driver.manage().timeouts().implicitlyWait(10000)
    @driver.findElement(xpath: "//*[contains(text(),'" + 'Oops! Your passwords do not match' + "')]")

  it 'sign up with a username that has already been taken', ->
    @driver.findElement(linkText: 'SIGN UP').click()
    @driver.manage().timeouts().implicitlyWait(10000)
    @driver.findElement(id: 'inputEmail').sendKeys(loginInfo)
    @driver.findElement(id: 'inputPassword').sendKeys('asdf')
    @driver.findElement(id: 'inputPasswordConfirm').sendKeys('asdf')
    @driver.findElement(id: 'inputUsername').sendKeys('asdf')
    @driver.findElement(id: 'contributor').click()
    @driver.findElement(id: 'terms').click()
    @driver.findElement(id: 'submit').click()
    @driver.manage().timeouts().implicitlyWait(10000)
    @driver.findElement(xpath: "//*[contains(text(),'" + 'That username is already taken.' + "')]")

  it 'sign up with an email that has already been taken', ->
    @driver.findElement(linkText: 'SIGN UP').click()
    @driver.manage().timeouts().implicitlyWait(10000)
    @driver.findElement(id: 'inputEmail').sendKeys('asdf')
    @driver.findElement(id: 'inputPassword').sendKeys('asdf')
    @driver.findElement(id: 'inputPasswordConfirm').sendKeys('asdf')
    @driver.findElement(id: 'inputUsername').sendKeys(loginInfo)
    @driver.findElement(id: 'contributor').click()
    @driver.findElement(id: 'terms').click()
    @driver.findElement(id: 'submit').click()
    @driver.manage().timeouts().implicitlyWait(10000)
    @driver.findElement(xpath: "//*[contains(text(),'" + 'That email has already been taken.' + "')]")

  it 'sign up without agreeing to terms and conditions', ->
    @driver.findElement(linkText: 'SIGN UP').click()
    @driver.manage().timeouts().implicitlyWait(10000)
    @driver.findElement(id: 'inputEmail').sendKeys(loginInfo)
    @driver.findElement(id: 'inputPassword').sendKeys('asdf')
    @driver.findElement(id: 'inputPasswordConfirm').sendKeys('asdf')
    @driver.findElement(id: 'inputUsername').sendKeys(loginInfo)
    @driver.findElement(id: 'contributor').click()
    @driver.findElement(id: 'submit').click()
    @driver.manage().timeouts().implicitlyWait(10000)
    @driver.findElement(xpath: "//*[contains(text(),'" + 'Oh snap!' + "')]")

  it 'sign up for a new account', ->
    @driver.findElement(linkText: 'SIGN UP').click()
    @driver.manage().timeouts().implicitlyWait(10000)
    @driver.findElement(id: 'inputEmail').sendKeys(loginInfo)
    @driver.findElement(id: 'inputPassword').sendKeys(loginInfo)
    @driver.findElement(id: 'inputPasswordConfirm').sendKeys(loginInfo)
    @driver.findElement(id: 'inputUsername').sendKeys(loginInfo)
    @driver.findElement(id: 'terms').click()
    @driver.findElement(id: 'submit').click()
    @driver.manage().timeouts().implicitlyWait(10000)

  it 'log in to newly created account', ->
    @driver.findElement(linkText: 'LOG IN').click()
    @driver.manage().timeouts().implicitlyWait(10000)
    @driver.findElement(id: 'inputEmail').sendKeys(loginInfo)
    @driver.findElement(id: 'inputPassword').sendKeys(loginInfo)
    @driver.findElement(id: 'loginButton').click()
    @driver.manage().timeouts().implicitlyWait(10000)
    @driver.findElement(linkText: 'Welcome, ' + loginInfo + '!').click()
    @driver.manage().timeouts().implicitlyWait(10000)
    @driver.findElement(linkText: 'BECOME A CONTRIBUTOR').click()
    @driver.manage().timeouts().implicitlyWait(10000)

  it 'check for contributor status', ->
    @driver.findElement(linkText: 'Welcome, ' + loginInfo + '!').click()
    @driver.manage().timeouts().implicitlyWait(10000)
    @driver.findElement(xpath: "//*[contains(text(),'" + 'You are a contributor!' + "')]")

  # it 'create a new comic', ->
  #   @driver.findElement(linkText: 'CREATE A COMIC').click()
  #   @driver.manage().timeouts().implicitlyWait(10000)
  #   @driver.findElement(id: 'title').sendKeys(loginInfo)
  #   @driver.findElement(id: 'description').sendKeys(loginInfo)
  #   @driver.findElement(id: 'tags').sendKeys(loginInfo)
  #   @driver.findElement(id: 'description').click()
  #   @driver.findElement(id: 'submit').click()
  #   @driver.manage().timeouts().implicitlyWait(10000)
  #   @driver.findElement(id: 'submit').click()

  # it 'check for newly created comic', ->
  #   @driver.findElement(linkText: 'Browse').click()
  #   @driver.manage().timeouts().implicitlyWait(10000)
  #   @driver.findElement(xpath: "//*[contains(text(),'" + loginInfo + "')]")

  it 'log out of newly created account', ->
    @driver.findElement(linkText: 'Log Out').click()
    @driver.manage().timeouts().implicitlyWait(10000)

  it 'delete newly created account', ->
    @driver.findElement(linkText: 'VIEW USERS').click()
    @driver.manage().timeouts().implicitlyWait(10000)
    @driver.findElement(id: loginInfo).click()
    @driver.manage().timeouts().implicitlyWait(10000)
    @driver.findElement(xpath: "//*[contains(text(),'" + 'There are currently' + "')]")
    @driver.findElement(xpath: "//*[contains(text(),'" + 'registered users' + "')]")


# run test with:
# mocha integration-test.coffee --compilers coffee:coffee-script/register

