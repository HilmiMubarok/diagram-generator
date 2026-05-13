declare module "bpmn-js-create-append-anything" {
  export const CreateAppendAnythingModule: { [key: string]: unknown };
  export const CreateAppendElementTemplatesModule: { [key: string]: unknown };
  export const RemoveTemplatesModule: { [key: string]: unknown };
}

declare module "bpmn-auto-layout" {
  export function layoutProcess(xml: string): Promise<string>;
}
