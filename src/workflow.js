import { createMockEditTask, createMockPublishPackage, createMockScript, generateMockTopics } from "./domain.js";
import { buildProviderProfiles, testProviderConnection } from "./providers.js";

export function runTopicStep(seed) {
  return generateMockTopics(seed);
}

export function runScriptStep(topic) {
  return createMockScript(topic);
}

export function runEditStep(project, assets) {
  return createMockEditTask(project, assets);
}

export function runPublishStep(project, script, editTask) {
  return createMockPublishPackage(project, script, editTask);
}

export function testWorkflowConnections(settings) {
  return Object.fromEntries(
    buildProviderProfiles(settings).map((profile) => [profile.id, testProviderConnection(profile, settings)])
  );
}
