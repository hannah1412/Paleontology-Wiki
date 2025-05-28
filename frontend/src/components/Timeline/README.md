# CS3099 Paleontology Supergroup Team 22 - Timeline Directory Structure

This document describes the directory structure for navigating different parts of the code for the Timeline component.

# General Structure 

## Backend: 

1. the backend code and cache files for the Timeline component are located in '~/project-code/backend'
    
    ~/project-code/backend/
    ├── timeline.py
    ├── wikidata_cache.json
    ├── wikipedia_views_cache.json


## Frontend: 

1. The /Timeline directory consists of 6 directories and 3 files. 

    ~/project-code/frontend/src/components/Timeline
    ├── Accessibility
    ├── Display
    ├── HeaderTabs
    ├── HistropediaAPI
    ├── Settings
        ├──SupergroupCode
    ├── Styles
    ├── Body.js
    └── TimelinePage.js
    ├── README.md

2. The root level contains Body.js and TimelinePage.js which imports other sub-components to generate the general layout of the Timeline page.

3. /Settings creates the settings panel at the top of the page. /Accessibility contains the code for the font settings accessibility feature.

4. /SupergroupCode directory under /Settings contains code for the settings panel where the majority of the code is contributed by student with ID 210016688 from the Tree Group.

5. /HeaderTabs handles the period and time interval selector sections. 

6. /Display manages the functionality of the Card and Timeline modes.

7. /HistropediaAPI contains the Histropedia API library used in all timeline displays.

8. /Styles contains CSS styles for all sub-components.

# Accessing the Website
The supergroup website as a whole can be accessed at the following link when one is connected to the school network:

`https://cs3099usersg2.teaching.cs.st-andrews.ac.uk`

Our timeline page can be accessed at the following link to the corresponding part of the website:

`https://cs3099usersg2.teaching.cs.st-andrews.ac.uk/timeline`

# Link to Development Environment Instructions
To reproduce the development environment and run the project on one's own system, one can follow the instructions in this document: [Development Environment](../../../../docs/dev-environment.md) 
# Thank You
