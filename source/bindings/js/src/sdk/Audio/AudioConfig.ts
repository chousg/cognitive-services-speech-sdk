//
// Copyright (c) Microsoft. All rights reserved.
// See https://aka.ms/csspeech/license201809 for the full license information.
//

import { FileAudioSource, MicAudioSource, PcmRecorder } from "../../common.browser/Exports";
import { AudioSourceEvent, EventSource, IAudioSource, IAudioStreamNode, Promise } from "../../common/exports";
import { AudioInputStream, PullAudioInputStreamCallback } from "../Exports";
import { PullAudioInputStreamImpl, PushAudioInputStreamImpl } from "./AudioInputStream";

/**
 * Represents audio input configuration used for specifying what type of input to use (microphone, file, stream).
 * @class AudioConfig
 */
export abstract class AudioConfig {
    /**
     * Creates an AudioConfig object representing the default microphone on the system.
     * @member AudioConfig.fromDefaultMicrophoneInput
     * @returns The audio input configuration being created.
     */
    public static fromDefaultMicrophoneInput(): AudioConfig {
        const pcmRecorder = new PcmRecorder();
        return new AudioConfigImpl(new MicAudioSource(pcmRecorder));
    }

    /**
     * Creates an AudioConfig object representing the specified file.
     * @member AudioConfig.fromWavFileInput
     * @param fileName - Specifies the audio input file. Currently, only WAV / PCM with 16-bit samples, 16 kHz sample rate, and a single channel (Mono) is supported.
     * @returns The audio input configuration being created.
     */
    public static fromWavFileInput(file: File): AudioConfig {
        return new AudioConfigImpl(new FileAudioSource(file));
    }

    /**
     * Creates an AudioConfig object representing the specified stream.
     * @member AudioConfig.fromStreamInput
     * @param audioStream - Specifies the custom audio input stream. Currently, only WAV / PCM with 16-bit samples, 16 kHz sample rate, and a single channel (Mono) is supported.
     * @param callback - Specifies the pull audio input stream callback. Currently, only WAV / PCM with 16-bit samples, 16 kHz sample rate, and a single channel (Mono) is supported.
     * @returns The audio input configuration being created.
     */
    public static fromStreamInput(audioStream: AudioInputStream | PullAudioInputStreamCallback): AudioConfig {
        if (audioStream instanceof PullAudioInputStreamCallback) {
            return new AudioConfigImpl(new PullAudioInputStreamImpl(audioStream as PullAudioInputStreamCallback));
        }

        if (audioStream instanceof AudioInputStream) {
            return new AudioConfigImpl(audioStream as PushAudioInputStreamImpl);
        }

        throw new Error("Not Supported Type");
    }

    /**
     * Explicitly frees any external resource attached to the object
     * @member AudioConfig.prototype.close
     */
    public abstract close(): void;
}

/**
 * Represents audio input stream used for custom audio input configurations.
 */
// tslint:disable-next-line:max-classes-per-file
export class AudioConfigImpl extends AudioConfig implements IAudioSource {
    private source: IAudioSource;

    public constructor(source: IAudioSource) {
        super();
        this.source = source;
    }

    public close(): void {
        this.source.TurnOff();
    }

    public Id(): string {
        return this.source.Id();
    }

    public TurnOn(): Promise<boolean> {
        return this.source.TurnOn();
    }

    public Attach(audioNodeId: string): Promise<IAudioStreamNode> {
        return this.source.Attach(audioNodeId);
    }

    public Detach(audioNodeId: string): void {
        return this.Detach(audioNodeId);
    }

    public TurnOff(): Promise<boolean> {
        return this.source.TurnOff();
    }

    public get Events(): EventSource<AudioSourceEvent> {
        return this.source.Events;
    }
}
