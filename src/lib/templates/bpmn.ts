import type { Template } from "../../types";

export const approvalWorkflow: Template = {
  id: "approval-workflow",
  name: "Approval Workflow",
  type: "bpmn",
  source: `<?xml version="1.0" encoding="UTF-8"?>
<definitions xmlns="http://www.omg.org/spec/BPMN/20100524/MODEL" xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI" xmlns:omgdc="http://www.omg.org/spec/DD/20100524/DC" xmlns:omgdi="http://www.omg.org/spec/DD/20100524/DI" id="definitions" targetNamespace="http://bpmn.io/schema/bpmn">
  <process id="Process_1" isExecutable="false">
    <startEvent id="StartEvent_1" name="Request Submitted">
      <outgoing>Flow_1</outgoing>
    </startEvent>
    <task id="Task_1" name="Review Request">
      <incoming>Flow_1</incoming>
      <outgoing>Flow_2</outgoing>
    </task>
    <exclusiveGateway id="Gateway_1" name="Approved?">
      <incoming>Flow_2</incoming>
      <outgoing>Flow_3</outgoing>
      <outgoing>Flow_4</outgoing>
    </exclusiveGateway>
    <task id="Task_2" name="Process Request">
      <incoming>Flow_3</incoming>
      <outgoing>Flow_5</outgoing>
    </task>
    <task id="Task_3" name="Reject Request">
      <incoming>Flow_4</incoming>
      <outgoing>Flow_6</outgoing>
    </task>
    <endEvent id="EndEvent_1" name="Completed">
      <incoming>Flow_5</incoming>
    </endEvent>
    <endEvent id="EndEvent_2" name="Rejected">
      <incoming>Flow_6</incoming>
    </endEvent>
    <sequenceFlow id="Flow_1" sourceRef="StartEvent_1" targetRef="Task_1" />
    <sequenceFlow id="Flow_2" sourceRef="Task_1" targetRef="Gateway_1" />
    <sequenceFlow id="Flow_3" name="Yes" sourceRef="Gateway_1" targetRef="Task_2" />
    <sequenceFlow id="Flow_4" name="No" sourceRef="Gateway_1" targetRef="Task_3" />
    <sequenceFlow id="Flow_5" sourceRef="Task_2" targetRef="EndEvent_1" />
    <sequenceFlow id="Flow_6" sourceRef="Task_3" targetRef="EndEvent_2" />
  </process>
  <bpmndi:BPMNDiagram id="BPMNDiagram_1">
    <bpmndi:BPMNPlane id="BPMNPlane_1" bpmnElement="Process_1">
      <bpmndi:BPMNShape id="_BPMNShape_StartEvent_1" bpmnElement="StartEvent_1">
        <omgdc:Bounds x="152" y="152" width="36" height="36" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="_BPMNShape_Task_1" bpmnElement="Task_1">
        <omgdc:Bounds x="240" y="130" width="100" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="_BPMNShape_Gateway_1" bpmnElement="Gateway_1" isMarkerVisible="true">
        <omgdc:Bounds x="395" y="145" width="50" height="50" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="_BPMNShape_Task_2" bpmnElement="Task_2">
        <omgdc:Bounds x="500" y="80" width="100" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="_BPMNShape_Task_3" bpmnElement="Task_3">
        <omgdc:Bounds x="500" y="190" width="100" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="_BPMNShape_EndEvent_1" bpmnElement="EndEvent_1">
        <omgdc:Bounds x="652" y="102" width="36" height="36" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="_BPMNShape_EndEvent_2" bpmnElement="EndEvent_2">
        <omgdc:Bounds x="652" y="212" width="36" height="36" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNEdge id="Flow_1_di" bpmnElement="Flow_1">
        <omgdi:waypoint x="188" y="170" />
        <omgdi:waypoint x="240" y="170" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_2_di" bpmnElement="Flow_2">
        <omgdi:waypoint x="340" y="170" />
        <omgdi:waypoint x="395" y="170" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_3_di" bpmnElement="Flow_3">
        <omgdi:waypoint x="420" y="145" />
        <omgdi:waypoint x="420" y="120" />
        <omgdi:waypoint x="500" y="120" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_4_di" bpmnElement="Flow_4">
        <omgdi:waypoint x="420" y="195" />
        <omgdi:waypoint x="420" y="230" />
        <omgdi:waypoint x="500" y="230" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_5_di" bpmnElement="Flow_5">
        <omgdi:waypoint x="600" y="120" />
        <omgdi:waypoint x="652" y="120" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_6_di" bpmnElement="Flow_6">
        <omgdi:waypoint x="600" y="230" />
        <omgdi:waypoint x="652" y="230" />
      </bpmndi:BPMNEdge>
    </bpmndi:BPMNPlane>
  </bpmndi:BPMNDiagram>
</definitions>`,
};

export const paymentProcess: Template = {
  id: "payment-process",
  name: "Payment Process",
  type: "bpmn",
  source: `<?xml version="1.0" encoding="UTF-8"?>
<definitions xmlns="http://www.omg.org/spec/BPMN/20100524/MODEL" xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI" xmlns:omgdc="http://www.omg.org/spec/DD/20100524/DC" xmlns:omgdi="http://www.omg.org/spec/DD/20100524/DI" id="definitions" targetNamespace="http://bpmn.io/schema/bpmn">
  <process id="Process_2" isExecutable="false">
    <startEvent id="StartEvent_1" name="Order Placed">
      <outgoing>Flow_1</outgoing>
    </startEvent>
    <task id="Task_1" name="Validate Payment">
      <incoming>Flow_1</incoming>
      <outgoing>Flow_2</outgoing>
    </task>
    <exclusiveGateway id="Gateway_1" name="Valid?">
      <incoming>Flow_2</incoming>
      <outgoing>Flow_3</outgoing>
      <outgoing>Flow_4</outgoing>
    </exclusiveGateway>
    <task id="Task_2" name="Process Payment">
      <incoming>Flow_3</incoming>
      <outgoing>Flow_5</outgoing>
    </task>
    <task id="Task_3" name="Notify Customer">
      <incoming>Flow_4</incoming>
      <outgoing>Flow_6</outgoing>
    </task>
    <task id="Task_4" name="Fulfill Order">
      <incoming>Flow_5</incoming>
      <outgoing>Flow_7</outgoing>
    </task>
    <endEvent id="EndEvent_1" name="Order Complete">
      <incoming>Flow_7</incoming>
    </endEvent>
    <endEvent id="EndEvent_2" name="Payment Failed">
      <incoming>Flow_6</incoming>
    </endEvent>
    <sequenceFlow id="Flow_1" sourceRef="StartEvent_1" targetRef="Task_1" />
    <sequenceFlow id="Flow_2" sourceRef="Task_1" targetRef="Gateway_1" />
    <sequenceFlow id="Flow_3" name="Yes" sourceRef="Gateway_1" targetRef="Task_2" />
    <sequenceFlow id="Flow_4" name="No" sourceRef="Gateway_1" targetRef="Task_3" />
    <sequenceFlow id="Flow_5" sourceRef="Task_2" targetRef="Task_4" />
    <sequenceFlow id="Flow_6" sourceRef="Task_3" targetRef="EndEvent_2" />
    <sequenceFlow id="Flow_7" sourceRef="Task_4" targetRef="EndEvent_1" />
  </process>
  <bpmndi:BPMNDiagram id="BPMNDiagram_1">
    <bpmndi:BPMNPlane id="BPMNPlane_1" bpmnElement="Process_2">
      <bpmndi:BPMNShape id="_BPMNShape_StartEvent_1" bpmnElement="StartEvent_1">
        <omgdc:Bounds x="152" y="152" width="36" height="36" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="_BPMNShape_Task_1" bpmnElement="Task_1">
        <omgdc:Bounds x="240" y="130" width="100" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="_BPMNShape_Gateway_1" bpmnElement="Gateway_1" isMarkerVisible="true">
        <omgdc:Bounds x="395" y="145" width="50" height="50" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="_BPMNShape_Task_2" bpmnElement="Task_2">
        <omgdc:Bounds x="500" y="80" width="100" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="_BPMNShape_Task_3" bpmnElement="Task_3">
        <omgdc:Bounds x="500" y="190" width="100" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="_BPMNShape_Task_4" bpmnElement="Task_4">
        <omgdc:Bounds x="660" y="80" width="100" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="_BPMNShape_EndEvent_1" bpmnElement="EndEvent_1">
        <omgdc:Bounds x="820" y="102" width="36" height="36" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="_BPMNShape_EndEvent_2" bpmnElement="EndEvent_2">
        <omgdc:Bounds x="660" y="212" width="36" height="36" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNEdge id="Flow_1_di" bpmnElement="Flow_1">
        <omgdi:waypoint x="188" y="170" />
        <omgdi:waypoint x="240" y="170" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_2_di" bpmnElement="Flow_2">
        <omgdi:waypoint x="340" y="170" />
        <omgdi:waypoint x="395" y="170" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_3_di" bpmnElement="Flow_3">
        <omgdi:waypoint x="420" y="145" />
        <omgdi:waypoint x="420" y="120" />
        <omgdi:waypoint x="500" y="120" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_4_di" bpmnElement="Flow_4">
        <omgdi:waypoint x="420" y="195" />
        <omgdi:waypoint x="420" y="230" />
        <omgdi:waypoint x="500" y="230" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_5_di" bpmnElement="Flow_5">
        <omgdi:waypoint x="600" y="120" />
        <omgdi:waypoint x="660" y="120" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_6_di" bpmnElement="Flow_6">
        <omgdi:waypoint x="600" y="230" />
        <omgdi:waypoint x="660" y="230" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_7_di" bpmnElement="Flow_7">
        <omgdi:waypoint x="760" y="120" />
        <omgdi:waypoint x="820" y="120" />
      </bpmndi:BPMNEdge>
    </bpmndi:BPMNPlane>
  </bpmndi:BPMNDiagram>
</definitions>`,
};

export const authenticationFlow: Template = {
  id: "authentication-flow",
  name: "Authentication Flow",
  type: "bpmn",
  source: `<?xml version="1.0" encoding="UTF-8"?>
<definitions xmlns="http://www.omg.org/spec/BPMN/20100524/MODEL" xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI" xmlns:omgdc="http://www.omg.org/spec/DD/20100524/DC" xmlns:omgdi="http://www.omg.org/spec/DD/20100524/DI" id="definitions" targetNamespace="http://bpmn.io/schema/bpmn">
  <process id="Process_3" isExecutable="false">
    <startEvent id="StartEvent_1" name="User Arrives">
      <outgoing>Flow_1</outgoing>
    </startEvent>
    <task id="Task_1" name="Enter Credentials">
      <incoming>Flow_1</incoming>
      <outgoing>Flow_2</outgoing>
    </task>
    <exclusiveGateway id="Gateway_1" name="Valid?">
      <incoming>Flow_2</incoming>
      <outgoing>Flow_3</outgoing>
      <outgoing>Flow_4</outgoing>
    </exclusiveGateway>
    <task id="Task_2" name="Generate Token">
      <incoming>Flow_3</incoming>
      <outgoing>Flow_5</outgoing>
    </task>
    <task id="Task_3" name="Show Error">
      <incoming>Flow_4</incoming>
      <outgoing>Flow_6</outgoing>
    </task>
    <task id="Task_4" name="Redirect to App">
      <incoming>Flow_5</incoming>
      <outgoing>Flow_7</outgoing>
    </task>
    <endEvent id="EndEvent_1" name="Authenticated">
      <incoming>Flow_7</incoming>
    </endEvent>
    <endEvent id="EndEvent_2" name="Login Failed">
      <incoming>Flow_6</incoming>
    </endEvent>
    <sequenceFlow id="Flow_1" sourceRef="StartEvent_1" targetRef="Task_1" />
    <sequenceFlow id="Flow_2" sourceRef="Task_1" targetRef="Gateway_1" />
    <sequenceFlow id="Flow_3" name="Yes" sourceRef="Gateway_1" targetRef="Task_2" />
    <sequenceFlow id="Flow_4" name="No" sourceRef="Gateway_1" targetRef="Task_3" />
    <sequenceFlow id="Flow_5" sourceRef="Task_2" targetRef="Task_4" />
    <sequenceFlow id="Flow_6" sourceRef="Task_3" targetRef="EndEvent_2" />
    <sequenceFlow id="Flow_7" sourceRef="Task_4" targetRef="EndEvent_1" />
  </process>
  <bpmndi:BPMNDiagram id="BPMNDiagram_1">
    <bpmndi:BPMNPlane id="BPMNPlane_1" bpmnElement="Process_3">
      <bpmndi:BPMNShape id="_BPMNShape_StartEvent_1" bpmnElement="StartEvent_1">
        <omgdc:Bounds x="152" y="152" width="36" height="36" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="_BPMNShape_Task_1" bpmnElement="Task_1">
        <omgdc:Bounds x="240" y="130" width="100" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="_BPMNShape_Gateway_1" bpmnElement="Gateway_1" isMarkerVisible="true">
        <omgdc:Bounds x="395" y="145" width="50" height="50" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="_BPMNShape_Task_2" bpmnElement="Task_2">
        <omgdc:Bounds x="500" y="80" width="100" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="_BPMNShape_Task_3" bpmnElement="Task_3">
        <omgdc:Bounds x="500" y="190" width="100" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="_BPMNShape_Task_4" bpmnElement="Task_4">
        <omgdc:Bounds x="660" y="80" width="100" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="_BPMNShape_EndEvent_1" bpmnElement="EndEvent_1">
        <omgdc:Bounds x="820" y="102" width="36" height="36" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="_BPMNShape_EndEvent_2" bpmnElement="EndEvent_2">
        <omgdc:Bounds x="660" y="212" width="36" height="36" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNEdge id="Flow_1_di" bpmnElement="Flow_1">
        <omgdi:waypoint x="188" y="170" />
        <omgdi:waypoint x="240" y="170" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_2_di" bpmnElement="Flow_2">
        <omgdi:waypoint x="340" y="170" />
        <omgdi:waypoint x="395" y="170" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_3_di" bpmnElement="Flow_3">
        <omgdi:waypoint x="420" y="145" />
        <omgdi:waypoint x="420" y="120" />
        <omgdi:waypoint x="500" y="120" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_4_di" bpmnElement="Flow_4">
        <omgdi:waypoint x="420" y="195" />
        <omgdi:waypoint x="420" y="230" />
        <omgdi:waypoint x="500" y="230" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_5_di" bpmnElement="Flow_5">
        <omgdi:waypoint x="600" y="120" />
        <omgdi:waypoint x="660" y="120" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_6_di" bpmnElement="Flow_6">
        <omgdi:waypoint x="600" y="230" />
        <omgdi:waypoint x="660" y="230" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_7_di" bpmnElement="Flow_7">
        <omgdi:waypoint x="760" y="120" />
        <omgdi:waypoint x="820" y="120" />
      </bpmndi:BPMNEdge>
    </bpmndi:BPMNPlane>
  </bpmndi:BPMNDiagram>
</definitions>`,
};

export const bpmnTemplates = [
  approvalWorkflow,
  paymentProcess,
  authenticationFlow,
];
