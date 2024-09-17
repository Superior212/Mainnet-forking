// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

interface IStudentRecord {
    function addStudent(
        string memory _name,
        uint _age,
        string memory _course
    ) external;
}
