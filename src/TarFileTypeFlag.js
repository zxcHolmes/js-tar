function TarFileTypeFlag(value, name) {
  this.value = value;
  this.id = "_" + value;
  this.name = name;
}

function TarFileTypeFlag_Instances() {
  this.Normal = new TarFileTypeFlag(0, "Normal");
  this.HardLink = new TarFileTypeFlag(1, "Hard Link");
  this.SymbolicLink = new TarFileTypeFlag(2, "Symbolic Link");
  this.CharacterSpecial = new TarFileTypeFlag(3, "Character Special");
  this.BlockSpecial = new TarFileTypeFlag(4, "Block Special");
  this.Directory = new TarFileTypeFlag(5, "Directory");
  this.FIFO = new TarFileTypeFlag(6, "FIFO");
  this.ContiguousFile = new TarFileTypeFlag(7, "Contiguous File");
  this._All = [
    this.Normal,
    this.HardLink,
    this.SymbolicLink,
    this.CharacterSpecial,
    this.BlockSpecial,
    this.Directory,
    this.FIFO,
    this.ContiguousFile,
  ];

  for (var i = 0; i < this._All.length; i++) {
    var item = this._All[i];
    this._All[item.id] = item;
  }
}

TarFileTypeFlag.Instances = new TarFileTypeFlag_Instances();