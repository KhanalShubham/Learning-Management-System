# Interfaces Directory

This directory defines architectural contracts (e.g. interfaces for repositories, services, and external integrations).

## Guidelines
- Write interfaces to decoupling layers. For example, `IStudentRepository` represents the shape that the actual `StudentRepository` must satisfy.
- By targeting interfaces in our business logic code, we can easily change or mock databases in test configurations.
