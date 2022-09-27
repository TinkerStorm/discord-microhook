// Derived from functionality within Eris and slash-create

const CR = "\r\n" as const;

export type SegmentVariant = Buffer | Record<string, any>;

export class MultipartData {
  get boundary() {
    return "-------------discord-multihook";
  }

  segments: Buffer[] = [];

  private header<Name extends string, Value extends string>(
    name: Name,
    value: Value
  ): `\r\n${Name}: ${Value};` {
    return `${CR}${name}: ${value};`;
  }

  private field<Name extends string, Value extends string>(
    name: Name,
    value: Value
  ): `${Name}="${Value}"` {
    return `${name}="${value}"`;
  }

  get contentType() {
    return `multipart/form-data; boundary=${this.boundary}`;
  }

  disposition = this.header("Content-Disposition", "form-data");

  private addSegment(segment: string | any) {
    this.segments.push(Buffer.from(segment));
    return this;
  }

  attach<Data extends SegmentVariant>(
    fieldName: string,
    data: Data | string,
    filename?: string
  ): this | undefined {
    if (data === undefined) {
      return;
    }

    if (Object.isFrozen(this)) {
      throw new Error("Cannot add segments to a finished MultipartData");
    }

    let segment =
      CR +
      `--${this.boundary}${this.disposition} ${this.field("name", fieldName)}`;
    if (filename) {
      segment += `; ${this.field("filename", filename)}`;
    }

    segment += CR + CR;

    if (data instanceof Buffer) {
      segment += this.header("Content-Type", "application/octet-stream");
    } else if (typeof data === "object") {
      segment += this.header("Content-Type", "application/json");
      data = JSON.stringify(data);
    } else {
      data = String(data);
    }

    return this.addSegment(segment + CR + CR).addSegment(data);
  }

  finish() {
    if (!Object.isFrozen(this)) {
      this.addSegment(CR + `--${this.boundary}--`);
      Object.freeze(this);
    }

    return this.segments;
  }
}
