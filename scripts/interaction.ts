import { ethers } from "hardhat";

async function main() {
  const [signer] = await ethers.getSigners();
  const studentRecordContractAddress =
    "0x85dE0882112F798058a6819e0D51a863Ac80563A";

  const studentRecord = await ethers.getContractAt(
    "IStudentRecord",
    studentRecordContractAddress
  );

  const name = "Ethereum";
  const age = 8;
  const course = "Blockchain";

  const tnx = await studentRecord.connect(signer).addStudent(name, age, course);

  tnx.wait();

  console.log(tnx);
}

main().catch(() => {
  console.error(Error);
  process.exit(1);
});
