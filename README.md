# cpsc484-posture-project-system

## Brief Description:
The Postural Analysis System is a final project developed for the CPSC 484 course. It aims to analyze and assess posture using computer vision techniques. The system detects key points in the human body to evaluate posture quality and provide feedback for corrective actions.

## Problem Space:
Poor posture can lead to various health issues such as back pain, fatigue, and musculoskeletal disorders. The project addresses the need for an automated system that can assist in evaluating and improving posture, especially in environments where prolonged sitting or standing is common.

## Installation Instructions:
1. Clone the project repository from the GitHub [link](https://github.com/Yale-CPSC484-HCI/recorder).
2. Ensure you have an Integrated Development Environment (IDE) installed on your system to run and edit web code.
3. There is a small amount of sample data in data/sample with which you can run the program. In order to play it back run the following code:
`pipenv run python src/main.py --data-path data/sample --mode play`
4. You're ready to use the Postural Analysis System!
   (Note: The recorded sample data is an optional dependency that can be installed if not connecting to TV-2 in Becton Center.)


## Tasks Addressed by the Installation:
The tasks this system aims to address are the following:
1. Periodically correct posture to practice maintaining good posture
2. Learn what behaviors contribute to poor posture
   
The first task is addressed by a combination of two of the main features of the system. By the TV displaying red boxes around passer-bys with bad posture, it is giving potential users a visual reminder to correct their posture. Our system then allows potential users to execute this under some guidance by providing stretching exercises that the users can then perform.
The second task is addressed by allowing users the choice to access a QR code (by lifting their left arm) that they can then scan using their phone and access information regarding posture, what behaviors contribute to poor posture, and how to improve their posture.

## Deployment Environment Constraints:
* **Physical Location:** The system is designed for deployment on a TV in a well-trafficked hallway. If deployed in a dissimilar environment, particularly without people within view, the program will not run accordingly.
* **Sensing Capabilities:** The system relies on specific sensing capabilities such as Kinect skeleton tracking and group detection. Verify that these capabilities are functional in the deployment environment and adjust sensor placement if necessary to optimize data collection.
* **Ambient Conditions:** Consider ambient lighting conditions and potential noise levels in the hallway. Ensure that the system can operate effectively under varying lighting conditions and noise levels to maintain accurate posture analysis.
* **Network Connectivity:** Although not explicitly mentioned in the physical environment, ensure that the system has reliable network connectivity to access any external resources or APIs required for data processing or analysis.
* **Physical Security:** Given the public location, consider physical security measures to protect the hardware components (TV screen, Kinect sensor, computer) from tampering or damage. If the HDMI cable to turn on the TV is disconnected, the program will not run.

## Collaboration Record
**Student Name and NetID: Jason Apostol JGA32**
Contribution: Depth display, CSS, posture heuristic - using data from Kinect sensor, completed posture analysis to determine if the posture is good or poor, met for testing on the TV

**Student Name and NetID: Mahal Montes emm254**
Contribution: CSS and aesthetic HTML changes for stretching activity, starting screen, and postural analysis, additional gifs + sources, wrote up readme after group discussion, met for testing on the TV

**Student Name and NetID: Shriya Anand sa2435**
Contribution: Overlaying canvas on image for rectangle display, creating the rectangle over the users and color coding them based off their posture, edits on writeup, created information pamphlet on posture and made it available on site via QR code, met for testing on the TV

**Student Name and NetID: Jason Zheng jz775**
Contribution: Initial WebSocket connection code, twod socket code, dynamic html code/state code, utilized data regarding joints from Kinect sensor to interpret user action as commands, met for testing on the TV
