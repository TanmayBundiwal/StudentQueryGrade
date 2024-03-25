Please edit this template and commit to the master branch for your user stories submission.   
Make sure to follow the *Role, Goal, Benefit* framework for the user stories and the *Given/When/Then* framework for the Definitions of Done! You can also refer to the examples DoDs in [C3 spec](https://sites.google.com/view/ubc-cpsc310-21w2-intro-to-se/project/checkpoint-3).

## User Story 1
As a UBC student user, I want to be able to view the courses of a specified department, 
so I can easily find courses in the subject I'm interested in

#### Definitions of Done(s)
Scenario 1: Input is selected from a menu of options
Given: The user is on the query building page
When: The user selects a department from a drop down menu and clicks "search"
Then: Courses (dept and id) that are in the department as specified are displayed

## User Story 2
As a UBC Student, I want to find all courses offered by a particular professor, 
so that I can know what other courses my favorite professor is offering.


#### Definitions of Done(s)
Scenario 1: Input type is valid.  
Given: The user (student) is on the query building page.  
When: The user enters the name of the professor in the instructor field and clicks "search".  
Then: The application searches the database and returns a set of results that are offered by the professor 
entered in the previous step.  


Scenario 2: Input type is invalid.  
Given: The user (student) is on the query building page.  
When: The user accidentally enters a number in the instructor field and clicks "search".  
Then: The application attempts to search the database, receives an error from backend, and displays a warning to user stating "instructor must contain characters other than just numbers".  


## Others
You may provide any additional user stories + DoDs in this section for general TA feedback.  
Note: These will not be graded.
