///<reference path='types/DefinitelyTyped/node/node.d.ts'/>
///<reference path='types/DefinitelyTyped/express/express.d.ts'/> 

class User {

}

class Viewer extends User {
	private favouriteComics: Comic[];
}

class Contributor extends Viewer {
	private contributions: Comic[];
	newComic(Comic) {

	}
	deleteComic(Comic) {

	}
	editComic(Comic) {

	}
}

class Comic {
	private numFavourites: int;
	private likes: int;
	private dislikes: int;
	private chapters: Chapter[];
	
}

class Comment {

}

class Chapter {

}
