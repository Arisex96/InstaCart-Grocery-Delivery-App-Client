import { BikeIcon } from "lucide-react";
import { Link } from "react-router";
import { footerData } from "../assets/assets";

const Footer = () => {
  const isExternalOrHash = (url: string) =>
    url.startsWith("http") || url.startsWith("#");

  return (
    <footer className="bg-linear-to-r from-emerald-950 via-emerald-900 to-emerald-950  w-full mt-auto">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand section */}
          <div className="flex flex-col gap-4 items-start">
            <div className="flex flex-row items-center gap-2">
              <BikeIcon className="size-6 text-white" />
              <span className="text-xl text-white font-semibold">
                {footerData.brand.name}
              </span>
            </div>
            <div className="text-sm text-white/80 leading-relaxed">
              {footerData.brand.description}
            </div>
            <div className="flex flex-row gap-4">
              {footerData.brand.socials.map((item, index) => {
                const Icon = item.icon;
                return (
                  <a
                    key={index}
                    href={item.link}
                    className="p-2 text-white text-sm bg-white/20 rounded-lg hover:bg-white/30 transition-all cursor-pointer flex items-center justify-center size-9"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Icon className="size-5" />
                  </a>
                );
              })}
            </div>
          </div>

          {/* Navigation sections */}
          {footerData.sections.map((section, index) => (
            <div key={index} className="flex flex-col gap-3 items-start">
              <div className="text-white font-semibold">{section.title}</div>
              <div className="flex flex-col gap-2 w-full">
                {section.links.map((link, linkIndex) => {
                  const path = link.to || (link as any).href || "#";
                  return isExternalOrHash(path) ? (
                    <a
                      key={linkIndex}
                      href={path}
                      className="text-white/80 text-sm hover:font-bold hover:text-white transition-all cursor-pointer"
                    >
                      {link.label}
                    </a>
                  ) : (
                    <Link
                      key={linkIndex}
                      to={path}
                      className="text-white/80 text-sm hover:font-bold hover:text-white transition-all cursor-pointer"
                    >
                      {link.label}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}

          {/* Contact section */}
          <div className="flex flex-col gap-3 items-start">
            <div className="text-white font-bold">Contact Us</div>
            <div className="flex flex-col gap-3 w-full">
              {footerData.contact.map((item, index) => {
                const Icon = item.icon;
                return (
                  <div
                    key={index}
                    className="text-white text-sm flex flex-row gap-3 items-center"
                  >
                    <Icon className="size-5 text-white/80" />
                    <span className="text-white/80">{item.text}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer Bottom */}
        <div className="mt-8 pt-8 border-t border-white/20 flex flex-col sm:flex-row gap-4 justify-between items-center w-full">
          <div className="text-white/80 text-xs">
            {footerData.bottom.copyright}
          </div>
          <div className="text-white/80 text-xs flex flex-row gap-6">
            {footerData.bottom.links.map((link, index) => (
              <a
                key={index}
                href={link.href}
                className="hover:font-semibold transition-all cursor-pointer text-white/80 hover:text-white"
              >
                {link.label}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
