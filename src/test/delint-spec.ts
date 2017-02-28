import * as chai from "chai";
import { readFileSync } from "fs";
import "mocha";
import * as ts from "typescript";
import { Delinter } from "../delint";
import * as uml from "../uml";
const expect = chai.expect;

describe("Delinter", () => {
    let sourceFile: ts.SourceFile;
    let delinter: Delinter;

    describe("#parse", () => {
        const TEST_FILE_CLASS = "testInput/delint/class.test.ts";
        const TEST_FILE_INTERFACE = "testInput/delint/interface.test.ts";

        describe("given class.test.ts", () => {
            before(() => {
                sourceFile = ts.createSourceFile(TEST_FILE_CLASS, readFileSync(TEST_FILE_CLASS).toString(),
                    ts.ScriptTarget.ES5, /*setParentNodes */ true);
            });

            beforeEach(() => {
                delinter = new Delinter();
            });

            it("should add class to uml program", () => {
                delinter.parse(sourceFile);
                expect(delinter.umlProgram.nodes.containsKey("Foo")).to.be.true;
                expect(delinter.umlProgram.nodes.getValue("Foo")).to.be.instanceof(uml.Class);
            });

            it("should add interfaces to uml program", () => {
                delinter.parse(sourceFile);
                expect(delinter.umlProgram.nodes.containsKey("IBar")).to.be.true;
                expect(delinter.umlProgram.nodes.containsKey("IFoo")).to.be.true;
                expect(delinter.umlProgram.nodes.getValue("IBar")).to.be.instanceof(uml.Interface);
                expect(delinter.umlProgram.nodes.getValue("IFoo")).to.be.instanceof(uml.Interface);
            });

            it("should not replace existing interfaces", () => {
                const interfaceIBar = new uml.Interface("IBar");
                delinter.umlProgram.nodes.setValue("IBar", interfaceIBar);

                delinter.parse(sourceFile);
                expect(delinter.umlProgram.nodes.getValue("IBar")).to.equal(interfaceIBar);
            });

            it("should add interface generalizations to uml program", () => {
                delinter.parse(sourceFile);
                expect(delinter.umlProgram.generalizations.filter((value) => {
                    return value.fromName === "Foo" && value.toName === "IBar";
                })).to.have.length(1, "Missing generalization from Foo to IBar");
                expect(delinter.umlProgram.generalizations.filter((value) => {
                    return value.fromName === "Foo" && value.toName === "IFoo";
                })).to.have.length(1, "Missing generalization from Foo to IFoo");
            });

            it("should add parent class to uml program", () => {
                delinter.parse(sourceFile);
                expect(delinter.umlProgram.nodes.containsKey("Bar")).to.be.true;
                expect(delinter.umlProgram.nodes.getValue("Bar")).to.be.instanceof(uml.Class);
            });

            it("should not replace existing classes", () => {
                const classBar = new uml.Class("Bar");
                delinter.umlProgram.nodes.setValue("Bar", classBar);

                delinter.parse(sourceFile);
                expect(delinter.umlProgram.nodes.getValue("Bar")).to.equal(classBar);
            });

            it("should add extension generalizations to uml program", () => {
                delinter.parse(sourceFile);
                expect(delinter.umlProgram.generalizations.filter((value) => {
                    return value.fromName === "Foo" && value.toName === "Bar";
                })).to.have.length(1, "Missing generalization from Foo to Bar");
            });

            describe("given interface.test.ts", () => {
                before(() => {
                    sourceFile = ts.createSourceFile(TEST_FILE_INTERFACE, readFileSync(TEST_FILE_INTERFACE).toString(),
                        ts.ScriptTarget.ES5, /*setParentNodes */ true);
                });

                beforeEach(() => {
                    delinter = new Delinter();
                });

                it("should add interface to uml program", () => {
                    delinter.parse(sourceFile);
                    expect(delinter.umlProgram.nodes.containsKey("IBar")).to.be.true;
                });
            });

        });
    });
});