Feature: Manifest Single Authorship
  In order to claim single authorship on a work
  As a creator
  I want to register its manifestation as a piece of content plus some descriptive metadata

  Scenario: Register a piece of content not previously registered
    Given I'm on the home page and authenticated
    When I click submenu option "Register" in menu "Registry"
    And I fill the register form with title "Te Hoho Rock at Cathedral Cove" and content file "Te Hoho Rock.jpg"
    And I click the "Register" button
    Then I see alert with text "Te Hoho Rock at Cathedral Cove" and close it
    And I see alert with text "Registration submitted, waiting for confirmation..." and close it

  Scenario: Register a piece of content previously registered
    Given I go to the home page
    When I click submenu option "Register" in menu "Registry"
    And I fill the register form with title "My view of Te Hoho Rock" and content file "Te Hoho Rock.jpg"
    And I click the "Register" button
    Then I see alert with text "Error registering creation, see log for details" and close it
